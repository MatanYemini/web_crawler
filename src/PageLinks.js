class PageLinks {
  constructor($, baseUrl) {
    this.pageElements = $;
    this.baseUrl = baseUrl;
  }

  // Define what is your relative path: such as: /badahim, /how-to, etc.
  collectRelativeLinks() {
    let pages = [];
    const relativeLinks = this.pageElements("a[href^='/']");
    console.log('Found ' + relativeLinks.length + ' relative links on page');
    for (let index = 0; index < relativeLinks.length; index++) {
      pages.push(
        `${this.baseUrl}${this.pageElements(relativeLinks[index]).attr('href')}`
      );
    }
    return pages;
  }

  // Define what is your absolute pathes: http://..../somethinggeneric - probably you don't have (only one instance)
  collectAbsoluteLinks() {
    let pages = [];
    const absoluteLinks = this.pageElements("a[href^='http']");
    console.log('Found ' + relativeLinks.length + ' absolute links on page');
    for (let index = 0; index < relativeLinks.length; index++) {
      pages.push(`${this.pageElements(absoluteLinks[index]).attr('href')}`);
    }
    return pages;
  }
}

module.exports = { PageLinks };
