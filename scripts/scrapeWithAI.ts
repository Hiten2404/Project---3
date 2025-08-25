  // Use require for CommonJS compatibility
  require('dotenv/config');
  const GoogleGenAI = require("@google/genai").GoogleGenAI;
  const { z } = require('zod');

  // --- Configuration ---
  const TARGET_URL = 'https://www.sarkariresult.com/latestjob/';
  const JOB_ID_REGEX = /\/([\w-]+)\.php$/;

  // --- Zod Schema for local validation ---
  const jobSchema = z.object({
    title: z.string(),
    department: z.string(),
    applicationDeadline: z.string().optional(),
  });

  const responseSchema = z.array(z.object({
    link: z.string().url(),
    ...jobSchema.shape,
  }));

  // --- Gemini API Schema for structured output ---
  // Use raw strings for types to avoid import issues in the build environment.
  const geminiResponseSchema = {
      type: 'ARRAY',
      items: {
          type: 'OBJECT',
          properties: {
              link: { type: 'STRING', description: 'The full URL to the job detail page.' },
              title: { type: 'STRING', description: 'The title of the job.' },
              department: { type: 'STRING', description: 'The name of the department or organization posting the job.' },
              applicationDeadline: { type: 'STRING', description: 'The last date to apply, in YYYY-MM-DD format if possible.' },
          },
          required: ['link', 'title', 'department'],
      }
  };


  // --- Main Function ---
  async function main() {
    console.log('🤖 Starting AI-powered scraping process...');

    // 1. Validate environment variables
    const { GEMINI_API_KEY, AUTOMATION_SECRET_KEY, VERCEL_APP_URL } = process.env;
    if (!GEMINI_API_KEY || !AUTOMATION_SECRET_KEY || !VERCEL_APP_URL) {
      console.error('❌ Missing required environment variables (GEMINI_API_KEY, AUTOMATION_SECRET_KEY, VERCEL_APP_URL).');
      (process as any).exit(1);
    }

    // 2. Fetch the target website's HTML
    let htmlContent;
    try {
      console.log(`🌐 Fetching HTML from ${TARGET_URL}...`);
      const response = await fetch(TARGET_URL);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      htmlContent = await response.text();
      console.log('✅ HTML content fetched successfully.');
    } catch (error) {
      console.error('❌ Failed to fetch HTML:', error);
      (process as any).exit(1);
    }
    
    // 3. Use Gemini AI to extract and structure the data
    let extractedJobs;
    try {
      console.log('🧠 Asking Gemini to analyze and extract job data...');
      const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

      const prompt = `
        You are an expert web scraping assistant. Your task is to analyze the provided HTML content from a job board and extract all job listings.
        Return the data as a valid JSON array that conforms to the provided schema.

        Here is the HTML content:
        \`\`\`html
        ${htmlContent}
        \`\`\`
      `;

      const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: prompt,
          config: {
              responseMimeType: "application/json",
              responseSchema: geminiResponseSchema,
          },
      });
      
      const rawJson = response.text.trim();
      extractedJobs = responseSchema.parse(JSON.parse(rawJson));
      console.log(`✅ Gemini successfully extracted ${extractedJobs.length} jobs.`);

    } catch (error) {
      console.error('❌ Failed to get structured data from Gemini:', error);
      (process as any).exit(1);
    }

    // 4. Format the extracted data for our API
    const formattedJobsForApi = extractedJobs.map(job => {
      // A simple way to generate a somewhat unique ID from the URL slug
      const match = job.link.match(JOB_ID_REGEX);
      const slug = match ? match[1] : job.link.split('/').pop() || 'unknown';
      // Create a numeric hash from the slug
      const id = slug.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 1000000;

      let deadlineISO;
      if (job.applicationDeadline) {
          try {
              // Attempt to parse dates like "DD/MM/YYYY" or other common formats
              const parts = job.applicationDeadline.split(/[-/]/);
              if (parts.length === 3) {
                  // Assuming DD/MM/YYYY
                  deadlineISO = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`).toISOString();
              } else {
                  deadlineISO = new Date(job.applicationDeadline).toISOString();
              }
          } catch(e) {
              deadlineISO = undefined; // Couldn't parse date
          }
      }


      return {
        id: id,
        title: job.title,
        department: job.department,
        category: 'uncategorized', // Default values, can be improved
        location: 'various',
        state: 'various',
        postedDate: new Date().toISOString(),
        applicationDeadline: deadlineISO,
        applicationUrl: job.link,
      };
    });
    
    // 5. Send the formatted data to our secure bulk import API
    try {
      console.log(`🚀 Sending ${formattedJobsForApi.length} jobs to the application API...`);
      const apiUrl = `${VERCEL_APP_URL}/api/jobs/bulk`;
      const apiResponse = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${AUTOMATION_SECRET_KEY}`,
        },
        body: JSON.stringify({ data: formattedJobsForApi }),
      });

      const responseJson = await apiResponse.json();
      if (!apiResponse.ok) {
        throw new Error(`API responded with status ${apiResponse.status}: ${JSON.stringify(responseJson)}`);
      }

      console.log('✅ Successfully synced jobs with the database.');
      console.log('📊 Summary:', responseJson.summary);
      if(responseJson.errors) {
          console.warn('⚠️ Errors during import:', responseJson.errors);
      }

    } catch (error) {
      console.error('❌ Failed to send data to the API:', error);
      (process as any).exit(1);
    }
  }

  main();
