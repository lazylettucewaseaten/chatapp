const { GoogleGenerativeAI } = require('@google/generative-ai');

const cheerio = require('cheerio');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const processMessageWithAI = async (message, roomFeatures) => {
    // 1. SCHEDULER AGENT
    if (roomFeatures.scheduler) {
        const timeWords = ['schedule', 'meet', 'tomorrow', 'at', 'pm', 'am', 'calendar' , 'deadline' ,'eod'];
        const isTimeRelated = timeWords.some(word => message.toLowerCase().includes(word));

        if (isTimeRelated) {
            const calendarLink = await runSchedulerAgent(message);
            if (calendarLink) {
                return {
                    type: 'calendar_invite',
                    url: calendarLink
                };
            }
        }
    }


    if (roomFeatures.linkSummarizer) {

        const urlwords  =['https'];
        const includedurlwords = urlwords.some(word => message.toLowerCase().includes(word));

        if(includedurlwords){
            const urlRegex = /https?:\/\/[^\s]+/g; 
            const url = message.match(urlRegex);
            if(url!=null && url.length > 0){
                const textforai=await scraper(url[0]);   
                const aioutput =await  runsummariseagent (textforai);
                return aioutput;
            }
            else{
                return null;
            }

            
        }
    }

    // If no agents were triggered, return null
    return null;
};

async function scraper(url) {
        try {
            const fetchResponse = await fetch(url);
            const html = await fetchResponse.text();

            const $ = cheerio.load(html);

            $('script, style, noscript, nav, header, footer').remove();

            let pageText = '';
            $('h1, h2, h3, p').each((i, element) => {
                pageText += $(element).text() + '\n';
            });

            const trimtext = pageText.replace(/\s+/g,' ').trim();
            return trimtext.substring(0,3000);
        } catch (error) {
            console.error("Failed to scrape URL:", error);
            return null;
        }
    }



const runSchedulerAgent = async (messageText) => {
    try {
        // Wgemini for now idk why 
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const currentDate = new Date().toString();

        const prompt = `
        You are a scheduling assistant. Analyze the following chat message and extract event details.
        CRITICAL CONTEXT: The current date and time right now is ${currentDate}. 
        You must calculate all relative dates (like "tomorrow", "next Friday", or dates without a year) relative to this current date!
        IMPORTANT: If the user mentions a specific date but does not mention a year, you MUST use the current year from the date provided above.

        If the message contains an intent to schedule something, extract the title, start time, and end time.
        Return ONLY a JSON object with exactly these keys: "isEvent", "title", "startTime", "endTime".
        Do NOT use snake_case like "start_time". Use exact camelCase: "startTime", "endTime".
        Format times in UTC string format (YYYYMMDDTHHMMSSZ).
        If there is no scheduling intent, return {"isEvent": false}.

        Message: "${messageText}"
        `;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        // console.log(currentDate);
        // console.log(responseText);

        
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        
        if (!jsonMatch) {
            console.error("No JSON found in response:", responseText);
            return null;
        }

        let eventData;
        try {
            eventData = JSON.parse(jsonMatch[0]);
        } catch (e) {
            console.error("JSON Parse Error on string:", jsonMatch[0]);
            return null;
        }

        if (eventData.isEvent === false || !eventData.title) {
            return null; 
        }

        const titleEncoded = encodeURIComponent(eventData.title);
        const dates = `${eventData.startTime}/${eventData.endTime}`;
        
        const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${titleEncoded}&dates=${dates}`;
        return url;

    } catch (error) {
        console.error("AI Scheduler Error:", error);
        return null;
    }
};




const runsummariseagent = async (messageText) => {
    try {

        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `Summarize the following text in exactly 2 sentences.
        
        Text: "${messageText}"`;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        
        return {
            type: 'link_summary',
            summary: responseText
        };
    } catch (error) {
        console.error("AI Summarizer Error:", error);
        return null;
    }
};



module.exports = {
    processMessageWithAI
};
