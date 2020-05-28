const cheerio = require('cheerio');
const axios = require('axios');
const URL = require('url-parse');
const { PageLinks } = require('./PageLinks');

const START_URL = 'http://www.arstechnica.com';
const SEARCH_WORD = 'eyes';
const MAX_PAGES_TO_VISIT = 30;

let pagesVisited = new Set();
let pagesToVisit = [];
let urlG = new URL(START_URL);
let numPagesVisited = 0;
var baseUrl = urlG.protocol + '//' + urlG.hostname;

const start = () => {
  pagesToVisit.push(START_URL);
  crawl();
};

function crawl() {
  if (numPagesVisited >= MAX_PAGES_TO_VISIT) {
    console.log('Reached max limit pages to visit in');
    return;
  }
  let nextPage = pagesToVisit.pop();
  if (nextPage in pagesVisited) {
    crawl(); // already been here - go next
  } else {
    visitPage(nextPage, crawl);
  }
}

async function visitPage(url, callback) {
  pagesVisited[url] = true;
  numPagesVisited++;

  // make the request
  console.log('Vising Page', url);

  try {
    const response = await axios.get(url);
    if (!response || response.status !== 200) {
      console.log('Could not get an OK response');
      callback();
      return;
    }
    // Parse document body
    const $ = cheerio.load(response.data);
    const linksCrawler = new PageLinks($, baseUrl);
    const isWordFound = await searchWord($, SEARCH_WORD);
    if (isWordFound) {
      console.log(`Word ${SEARCH_WORD} was found at page ${url}`);
    } else {
      pagesToVisit = pagesToVisit.concat(linksCrawler.collectRelativeLinks());

      callback();
    }
  } catch (err) {
    console.log(err);
  }
}

const searchWord = async ($, word) => {
  // Selecting the body element
  const bodyText = await $('html > body').text();
  return bodyText.toLowerCase().indexOf(word.toLowerCase()) !== -1;
};

start();
