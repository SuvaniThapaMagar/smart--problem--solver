const axios = require("axios");
const cheerio = require("cheerio");

// Configure axios defaults
const axiosInstance = axios.create({
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5'
  },
  timeout: 5000
});

// Delay function to prevent rate limiting
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Scrape YouTube for a video tutorial
const scrapeYouTubeVideo = async (searchTerm) => {
  try {
    const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(searchTerm + " tutorial")}`;
    const { data } = await axiosInstance.get(url);
    
    // YouTube's content is dynamically loaded with JavaScript
    // We'll need to look for the initial data in the page
    const videoRegex = /"videoId":"([^"]+)","thumbnail":.*?"title":\{"runs":\[{"text":"([^"]+)"\}/;
    const match = data.match(videoRegex);
    
    if (match) {
      const [, videoId, title] = match;
      return {
        title: title,
        link: `https://www.youtube.com/watch?v=${videoId}`
      };
    }
    
    return { title: '', link: '' };
  } catch (error) {
    console.error("Error scraping YouTube:", error.message);
    return { title: '', link: '' };
  }
};

// Scrape Google search results for tutorial links
const scrapeGoogleLinks = async (searchTerm) => {
  try {
    // Add random delay between 1-3 seconds
    await delay(1000 + Math.random() * 2000);
    
    const url = `https://www.google.com/search?q=${encodeURIComponent(searchTerm + " tutorial")}`;
    const { data } = await axiosInstance.get(url);
    const $ = cheerio.load(data);
    
    const googleLinks = [];
    
    // Updated selector for Google search results
    $("div.g").each((index, element) => {
      if (googleLinks.length >= 5) return false; // Limit to 5 results
      
      const titleElement = $(element).find("h3").first();
      const linkElement = $(element).find("a").first();
      const descriptionElement = $(element).find("div.VwiC3b").first();
      
      if (titleElement.length && linkElement.length) {
        const link = linkElement.attr("href");
        // Only include if it's a valid URL
        if (link && link.startsWith("http")) {
          googleLinks.push({
            title: titleElement.text().trim(),
            link: link,
            description: descriptionElement.text().trim()
          });
        }
      }
    });
    
    return googleLinks;
  } catch (error) {
    if (error.response && error.response.status === 429) {
      console.error("Rate limited by Google. Implementing longer delay...");
      await delay(5000); // Wait 5 seconds
      return []; // Return empty array for this attempt
    }
    console.error("Error scraping Google:", error.message);
    return [];
  }
};

// Main function to scrape both YouTube and Google
const scrapeTutorials = async (searchTerm) => {
  if (!searchTerm || typeof searchTerm !== 'string') {
    console.error("Invalid search term provided");
    return {
      youtubeVideo: { title: '', link: '' },
      googleLinks: []
    };
  }

  try {
    // Run YouTube and Google scraping in parallel
    const [youtubeVideo, googleLinks] = await Promise.all([
      scrapeYouTubeVideo(searchTerm).catch(error => {
        console.error("YouTube scraping failed:", error.message);
        return { title: '', link: '' };
      }),
      scrapeGoogleLinks(searchTerm).catch(error => {
        console.error("Google scraping failed:", error.message);
        return [];
      })
    ]);

    return {
      youtubeVideo: youtubeVideo || { title: '', link: '' },
      googleLinks: googleLinks || []
    };
  } catch (error) {
    console.error("Error in main scraping function:", error.message);
    return {
      youtubeVideo: { title: '', link: '' },
      googleLinks: []
    };
  }
};

module.exports = { scrapeTutorials };