const axios = require("axios");
const cheerio = require("cheerio");

// Scrape YouTube for a video tutorial
const scrapeYouTubeVideo = async (searchTerm) => {
  const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(searchTerm)}`;

  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    
    // Example: Adjust selectors based on YouTube's structure
    const video = {};
    const firstResult = $("a#video-title").first();

    video.title = firstResult.text();
    video.link = `https://www.youtube.com${firstResult.attr("href")}`;

    return video;
  } catch (error) {
    console.error("Error scraping YouTube:", error);
    return null;
  }
};

// Scrape Google search results for tutorial links
const scrapeGoogleLinks = async (searchTerm) => {
  const url = `https://www.google.com/search?q=${encodeURIComponent(searchTerm)}+tutorial`;

  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    const googleLinks = [];

    // Example: Adjust selectors based on Google's structure
    $("div.yuRUbf > a").each((index, element) => {
      const link = $(element).attr("href");
      const title = $(element).find("h3").text();

      googleLinks.push({ title, link });
    });

    return googleLinks;
  } catch (error) {
    console.error("Error scraping Google:", error);
    return [];
  }
};

// Main function to scrape both YouTube and Google
const scrapeTutorials = async (searchTerm) => {
  try {
    // Scrape YouTube for a video tutorial
    const youtubeVideo = await scrapeYouTubeVideo(searchTerm);

    // Scrape Google for tutorial links
    const googleLinks = await scrapeGoogleLinks(searchTerm);

    return {
      youtubeVideo,
      googleLinks,
    };
  } catch (error) {
    console.error("Error scraping tutorials:", error);
    return {
      youtubeVideo: null,
      googleLinks: [],
    };
  }
};

module.exports = { scrapeTutorials };
