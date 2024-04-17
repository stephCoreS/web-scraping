const fs = require("fs");
const puppeteer = require("puppeteer");

async function scrapeDataFromPage(page) {
  try {
    const links = await page.evaluate(() => {
      const titleElement = document.querySelector("#MainContainer h1");
      const speakerElement = document.querySelector(
        "#ctl00_ctl00_subMaster_mainBody_ctl00_CEDetailHeader_lbSpeaker"
      );
      const formatElement = document.querySelector(
        "#ctl00_ctl00_subMaster_mainBody_ctl00_CEDetailHeader_lbFormat"
      );
      const releaseDateElement = document.querySelector(
        "#ctl00_ctl00_subMaster_mainBody_ctl00_CEDetailHeader_lbReleaseDate"
      );
      const descriptionElement = document.querySelector(".CEDescription");
      const educationalObjectivesElement = document.querySelector(".bullet");

      // Define default values for fields
      const defaultTitle = "Not found";
      const defaultSpeaker = "Not found";
      const defaultFormat = "Not found";
      const defaultReleaseDate = "Not found";
      const defaultDescription = "Not found";
      const defaultEducationalObjectives = "Not found";

      // Check if any of the elements are null and set default values if necessary
      const title = titleElement ? titleElement.innerText : defaultTitle;
      const speaker = speakerElement
        ? speakerElement.innerText
        : defaultSpeaker;
      const format = formatElement ? formatElement.innerText : defaultFormat;
      const releaseDate = releaseDateElement
        ? releaseDateElement.innerText
        : defaultReleaseDate;
      const description = descriptionElement
        ? descriptionElement.innerText
        : defaultDescription;
      const educationalObjectives = educationalObjectivesElement
        ? educationalObjectivesElement.innerText
        : defaultEducationalObjectives;

      return {
        title,
        speaker,
        format,
        releaseDate,
        description,
        educationalObjectives,
      };
    });
    return links;
  } catch (error) {
    console.error("Error scraping data:", error.message);
    return null; // Return null to indicate that scraping failed for this page
  }
}

async function run() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // Read URLs from JSON file
  const urlData = JSON.parse(fs.readFileSync("urls.json", "utf8"));
  const urls = urlData.urls;

  let allData = [];

  for (const url of urls) {
    await page.goto(url);

    // Scrape data from the page
    const data = await scrapeDataFromPage(page);

    // Push scraped data to array
    allData.push(data);
  }

  // Save all data to JSON file
  fs.writeFile("scraped_data.json", JSON.stringify(allData), (err) => {
    if (err) throw err;
    console.log("All scraped data saved to scraped_data.json");
  });

  await browser.close();
}

run();
