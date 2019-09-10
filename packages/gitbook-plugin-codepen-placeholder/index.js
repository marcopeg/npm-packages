module.exports = {
    blocks: {
        codepen: function (block) {
            const config = this.config.values.pluginsConfig['codepen-placeholder']
            console.log(config)

            // if (!config) return console.warn('disqus-legacy config missed')
            return `<iframe
                height="265"
                style="width: 100%;"
                scrolling="no"
                title="HTML Hello World"
                src="//codepen.io/marcopeg/embed/preview/OJLvLRq/?height=265&theme-id=0&default-tab=html,result"
                frameborder="no"
                allowtransparency="true"
                allowfullscreen="true">
                    See the Pen <a href='https://codepen.io/marcopeg/pen/OJLvLRq/'>HTML Hello World</a> by Marco Pegoraro
                    (<a href='https://codepen.io/marcopeg'>@marcopeg</a>) on <a href='https://codepen.io'>CodePen</a>.
            </iframe>`
        }
    },
}
