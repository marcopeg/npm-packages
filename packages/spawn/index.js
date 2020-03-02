const { spawn: spawnCmd } = require("child_process");

const pids = {};

const spawn = (cmd, options = {}) => {
  const { log, timeout, ...otherOptions } = options;
  const tokens = cmd.split(" ");
  const stdout = [];
  const stderr = [];

  const ctime = process.hrtime();
  const child = spawnCmd(tokens.shift(), tokens, otherOptions);

  const p = new Promise((resolve, reject) => {
    // Reference the process in the module's scope in order
    // to handle external signals (process level SIGKILL)
    pids[child.pid] = child;

    const applyReject = (err, kill) => {
      clearTimeout(__timeout);
      applyReject.called = true;
      pids[child.pid] = null;
      kill && child.kill("SIGINT");
      reject(err);
    };

    const applyResolve = data => {
      if (applyReject.called || applyResolve.called) {
        return;
      }

      clearTimeout(__timeout);
      applyResolve.called = true;
      pids[child.pid] = null;

      const etime = process.hrtime(ctime);
      const elapsedNano = etime[0] * 1000000000 + etime[1];

      resolve({
        ...data,
        elapsed: Math.round(elapsedNano / 1000000),
        elapsedNano
      });
    };

    const __timeout =
      timeout === undefined
        ? null
        : setTimeout(() => {
            applyReject(new Error("timeout"), true);
          }, timeout);

    child.stdout.on("data", data => {
      const str = data.toString().trim();
      log && log(str, data);
      stdout.push(str);
    });

    child.stderr.on("data", data => {
      const str = data.toString().trim();
      log && log(str, data, true);
      stderr.push(data.toString().trim());
    });

    child.on("close", code => {
      applyResolve({
        code,
        stdout,
        stderr
      });
    });

    child.on("error", applyReject);
    child.on("KILL", () => applyReject(new Error("killed"), true));
  });

  // Expose the entire child process to the external app
  p.child = child;

  // Expose an API to forcefully kill the process from the outside
  p.kill = () => child.emit("KILL");

  return p;
};

spawn.killAll = () =>
  Object.values(pids).forEach(child => child && child.emit("KILL"));

// Attempt to kill all the registered child processes on main
// process exit
process.on("SIGINT", spawn.killAll);
process.on("exit", spawn.killAll);

module.exports = spawn;
