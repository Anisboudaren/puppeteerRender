const puppeteer = require("puppeteer");
require("dotenv").config();

const generatePDF = async (htmlContent, filename) => {
  const browser = await puppeteer.launch({
      args: [
        "--disable-setuid-sandbox",
        "--no-sandbox",
        "--single-process",
        "--no-zygote",
      ],
      executablePath:
        process.env.NODE_ENV === "production"
          ? process.env.PUPPETEER_EXECUTABLE_PATH
          : puppeteer.executablePath(),
    });

  try {
      const page = await browser.newPage();
      await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
      await page.pdf({ path: filename, format: 'A4', printBackground: true });
      console.log(`PDF generated successfully at: ${filename}`);
  } catch (error) {
      console.error('Error generating PDF:', error);
  } finally {
      try {
          await browser.close();
          console.log('Browser closed successfully.');
      } catch (closeError) {
          console.error('Error closing browser:', closeError);
      }
  }

  return filename;
}


module.exports = { generatePDF };


