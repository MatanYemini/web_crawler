var axios = require('axios');
var cheerio = require('cheerio');
var URL = require('url-parse');

var START_URL = 'http://www.arstechnica.com';
var SEARCH_WORD = 'stemming';
var MAX_PAGES_TO_VISIT = 10;

var pagesVisited = {};
var numPagesVisited = 0;
var pagesToVisit = [];
var url = new URL(START_URL);
var baseUrl = url.protocol + '//' + url.hostname;

pagesToVisit.push(START_URL);
crawl();

function crawl() {
  if (numPagesVisited >= MAX_PAGES_TO_VISIT) {
    console.log('Reached max limit of number of pages to visit.');
    return;
  }
  var nextPage = pagesToVisit.pop();
  if (nextPage in pagesVisited) {
    // We've already visited this page, so repeat the crawl
    crawl();
  } else {
    // New page we haven't visited
    visitPage(nextPage, crawl);
  }
}

async function visitPage(url, callback) {
  // Add page to our set
  pagesVisited[url] = true;
  numPagesVisited++;

  // Make the request
  console.log('Visiting page ' + url);
  try {
    const response = await axios.get(url);
    if (!response || response.statusCode !== 200) {
      callback();
      return;
    }
    // Parse the document body
    var $ = cheerio.load(response.body);
    var isWordFound = searchForWord($, SEARCH_WORD);
    if (isWordFound) {
      console.log('Word ' + SEARCH_WORD + ' found at page ' + url);
    } else {
      collectInternalLinks($);
      // In this short program, our callback is just calling crawl()
      callback();
    }
  } catch (error) {
    console.log(error);
  }
}

function searchForWord($, word) {
  var bodyText = $('html > body').text().toLowerCase();
  return bodyText.indexOf(word.toLowerCase()) !== -1;
}

function collectInternalLinks($) {
  var relativeLinks = $("a[href^='/']");
  console.log('Found ' + relativeLinks.length + ' relative links on page');
  relativeLinks.each(function () {
    pagesToVisit.push(baseUrl + $(this).attr('href'));
  });
}
