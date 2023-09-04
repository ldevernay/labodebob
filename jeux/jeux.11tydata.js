const {titleCase} = require("title-case");

// This regex finds all wikilinks in a string
const wikilinkRegExp = /\[\[\s?([^\[\]\|\n\r]+)(\|[^\[\]\|\n\r]+)?\s?\]\]/g

function caselessCompare(a, b) {
    return a.normalize().toLowerCase() === b.normalize().toLowerCase();
}

module.exports = {
    layout: "jeu.html",
    type: "jeu",
    eleventyComputed: {
        title: data => titleCase(data.title || data.page.fileSlug),
        backlinks: (data) => {
            const jeux = data.collections.jeux;
            const currentFileSlug = data.page.filePathStem.replace('/jeux/', '');

            let backlinks = [];

            // Search the other jeux for backlinks
            for(const otherJeu of jeux) {
                const jeuContent = otherJeu.template.frontMatter.content;

                // Get all links from otherJeu
                const outboundLinks = (jeuContent.match(wikilinkRegExp) || [])
                    .map(link => (
                        // Extract link location
                        link.slice(2,-2)
                            .split("|")[0]
                            .replace(/.(md|markdown)\s?$/i, "")
                            .trim()
                    ));

                // If the other jeu links here, return related info
                if(outboundLinks.some(link => caselessCompare(link, currentFileSlug))) {

                    // Construct preview for hovercards
                    let preview = jeuContent.slice(0, 240);

                    backlinks.push({
                        url: otherJeu.url,
                        title: otherJeu.data.title,
                        preview
                    })
                }
            }

            return backlinks;
        }
    }
}
