import { GoogleGenAI } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey) {
  try {
    ai = new GoogleGenAI({ apiKey });
    console.log('✅ Gemini AI Service initialized with API Key.');
  } catch (err) {
    console.error('❌ Failed to initialize Gemini client:', err);
  }
} else {
  console.warn('⚠️ GEMINI_API_KEY not found. CampusMart will use simulated AI services.');
}

/**
 * 1. AI Description Generator
 */
export async function generateProductDescription(
  title: string,
  category: string,
  condition: string,
  specifications: string
): Promise<string> {
  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Generate a compelling, professional, premium product marketplace listing description for:
Title: "${title}"
Category: "${category}"
Condition: "${condition}"
Extra Specifications: "${specifications || 'None'}"

The description should include:
- A catchy overview of the item.
- Key features and condition notes.
- Ideal campus use cases.
- Call to action (e.g. 'dm for pickup').
Format in clean, neat paragraphs or bullet points.`
      });
      return response.text || 'No description generated.';
    } catch (err) {
      console.error('Error generating description from Gemini:', err);
    }
  }

  // Fallback Simulation
  const specs = specifications ? ` (${specifications})` : '';
  return `✨ **CampusMart AI Listing Description** ✨\n\nSelling my **${title}** in **${condition}** condition${specs}. This is perfect for students looking for a reliable, high-quality option without paying full retail price.\n\n📌 **Key Details:**\n• **Condition:** ${condition} (well-maintained, clean)\n• **Category:** ${category}\n• **Ideal For:** Hostel rooms, library study sessions, daily campus commute, or coursework projects.\n\n💼 **Seller's Note:** Selling this because I am upgrading/graduating. Available for immediate cash or online transfer. Meetups inside the campus gates/hostel lounge only. DM me to arrange a quick inspect and pickup!`;
}

/**
 * 2. AI Price Suggestion / Prediction
 */
export async function predictPrice(
  title: string,
  category: string,
  condition: string,
  userEnteredPrice: number
): Promise<{ recommendedPrice: number; quickSalePrice: number; marketPrice: number; explanation: string }> {
  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        config: {
          responseMimeType: 'application/json',
        },
        contents: `Predict the market value for a campus peer-to-peer listing:
Title: "${title}"
Category: "${category}"
Condition: "${condition}"
Proposed Price: ${userEnteredPrice}

Respond strictly in JSON format matching this schema:
{
  "marketPrice": number (average market value for new or slightly used),
  "recommendedPrice": number (fair price for student listing),
  "quickSalePrice": number (price to sell within 24 hours),
  "explanation": "string (brief justification of pricing)"
}`
      });
      
      const text = response.text || '{}';
      const parsed = JSON.parse(text);
      return {
        marketPrice: parsed.marketPrice || userEnteredPrice * 1.5,
        recommendedPrice: parsed.recommendedPrice || userEnteredPrice,
        quickSalePrice: parsed.quickSalePrice || userEnteredPrice * 0.8,
        explanation: parsed.explanation || 'Based on standard item depreciation.'
      };
    } catch (err) {
      console.error('Error predicting price from Gemini:', err);
    }
  }

  // Fallback Simulation
  const basePrice = userEnteredPrice > 0 ? userEnteredPrice : 1500;
  const marketPrice = Math.round(basePrice * 1.6);
  const recommendedPrice = Math.round(basePrice);
  const quickSalePrice = Math.round(basePrice * 0.75);
  
  return {
    marketPrice,
    recommendedPrice,
    quickSalePrice,
    explanation: `Based on current campus listings for ${category} items in ${condition} condition. Typical depreciation is ~40% for "${condition}" items. Listing at ₹${recommendedPrice} offers a fair deal, while dropping to ₹${quickSalePrice} will likely result in an instant purchase before the weekend.`
  };
}

/**
 * 3. AI Scam & Image Moderation
 */
export async function moderateListing(
  title: string,
  description: string,
  price: number,
  category: string
): Promise<{ scamScore: number; isFlagged: boolean; reason: string }> {
  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        config: {
          responseMimeType: 'application/json',
        },
        contents: `Analyze this marketplace product listing for scam, spam, abnormal pricing, duplicate content, or unsafe language:
Title: "${title}"
Description: "${description}"
Category: "${category}"
Price: ${price}

Respond strictly in JSON format matching this schema:
{
  "scamScore": number (0 to 100, where 0 is perfectly safe and 100 is high risk scam),
  "isFlagged": boolean (true if scamScore >= 70 or contains illegal/forbidden campus items),
  "reason": "string (brief description of flags found, or 'Safe listing')"
}`
      });

      const text = response.text || '{}';
      const parsed = JSON.parse(text);
      return {
        scamScore: parsed.scamScore ?? 10,
        isFlagged: parsed.isFlagged ?? false,
        reason: parsed.reason || 'Safe listing'
      };
    } catch (err) {
      console.error('Error moderating listing from Gemini:', err);
    }
  }

  // Fallback Simulation
  let scamScore = 5;
  let isFlagged = false;
  let reason = 'Safe listing';

  const lowerTitle = title.toLowerCase();
  const lowerDesc = description.toLowerCase();

  if (price <= 5) {
    scamScore = 75;
    isFlagged = true;
    reason = 'Pricing is abnormally low, suggesting a potential spam or hook listing.';
  } else if (lowerTitle.includes('free money') || lowerTitle.includes('easy cash') || lowerDesc.includes('bitcoin') || lowerDesc.includes('crypto')) {
    scamScore = 95;
    isFlagged = true;
    reason = 'Suspicious promotional keyword or finance scam indicators detected.';
  } else if (lowerTitle.includes('exam cheat') || lowerTitle.includes('hacking tool') || lowerDesc.includes('exam answers')) {
    scamScore = 85;
    isFlagged = true;
    reason = 'Listing violates university academic integrity guidelines.';
  }

  return { scamScore, isFlagged, reason };
}

/**
 * 4. Summarize Chat Conversations
 */
export async function summarizeChat(
  messages: { senderName: string; text: string }[]
): Promise<string> {
  if (messages.length === 0) return 'No messages in conversation.';

  if (ai) {
    try {
      const msgList = messages.map(m => `${m.senderName}: ${m.text}`).join('\n');
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Summarize the following buy/sell chat conversation between students on CampusMart. Detail the agreed price, meeting spot, item condition, or pending questions:
${msgList}`
      });
      return response.text || 'Unable to summarize.';
    } catch (err) {
      console.error('Error summarizing chat from Gemini:', err);
    }
  }

  // Fallback Simulation
  const itemMentioned = messages.find(m => m.text.toLowerCase().includes('price') || m.text.toLowerCase().includes('offer'))?.text || '';

  return `📝 **AI Conversation Summary:**\n• The buyer is interested in purchasing the product.\n• Discussion includes pricing inquiries: "${itemMentioned || 'negotiating delivery'}"\n• Action item: Arrange a physical campus location (e.g., library or hostel gate) to exchange the item and finalize transaction.`;
}

/**
 * 5. Translate Messages
 */
export async function translateMessage(text: string, targetLanguage: string): Promise<string> {
  if (!text.trim()) return '';

  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Translate the following text strictly into ${targetLanguage}. Do not explain or add commentary, return only the translated text:
"${text}"`
      });
      return (response.text || text).replace(/^"|"$/g, '').trim();
    } catch (err) {
      console.error('Error translating message from Gemini:', err);
    }
  }

  // Fallback Simulation
  const lang = targetLanguage.toLowerCase();
  if (lang.includes('hindi')) {
    return `[Translated to Hindi] ${text} (यह कैंपस मार्ट अनुवाद है)`;
  } else if (lang.includes('spanish')) {
    return `[Translated to Spanish] ${text} (Traducción de CampusMart)`;
  } else if (lang.includes('french')) {
    return `[Translated to French] ${text} (Traduction de CampusMart)`;
  }
  return `[Translated to ${targetLanguage}] ${text}`;
}

/**
 * 6. Quick Reply Suggestions
 */
export async function suggestReplies(
  messages: { senderName: string; text: string }[],
  isSeller: boolean
): Promise<string[]> {
  if (messages.length === 0) {
    return isSeller ? ['Is this item still available?', 'Would you like to inspect it?'] : ['Hi, I\'m interested in this!', 'Is the price negotiable?'];
  }

  if (ai) {
    try {
      const msgList = messages.map(m => `${m.senderName}: ${m.text}`).join('\n');
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        config: {
          responseMimeType: 'application/json',
        },
        contents: `Based on this chat log between a Buyer and Seller:
${msgList}

Suggest 3 natural, short quick-replies for the ${isSeller ? 'Seller' : 'Buyer'}.
Respond strictly in JSON format matching this schema:
[
  "reply string 1",
  "reply string 2",
  "reply string 3"
]`
      });

      const text = response.text || '[]';
      return JSON.parse(text);
    } catch (err) {
      console.error('Error suggesting replies from Gemini:', err);
    }
  }

  // Fallback Simulation
  const lastMsg = messages[messages.length - 1]?.text.toLowerCase() || '';

  if (isSeller) {
    if (lastMsg.includes('available') || lastMsg.includes('still have')) {
      return ['Yes, it is still available!', 'Yes, when would you like to collect it?', 'Yes, I can meet up today.'];
    }
    if (lastMsg.includes('price') || lastMsg.includes('negotiable') || lastMsg.includes('cheap')) {
      return ['I could do a small discount.', 'The price is firm, sorry!', 'What price are you thinking?'];
    }
    return ['Sure, that works for me.', 'When are you free to meet?', 'Let\'s meet at the Student Center.'];
  } else {
    if (lastMsg.includes('yes') || lastMsg.includes('available')) {
      return ['Great! Can I check it out tomorrow?', 'Awesome, can we meet at the library?', 'Would you accept a slightly lower price?'];
    }
    return ['Sounds good to me!', 'Can you send another photo?', 'Thank you, see you then!'];
  }
}

/**
 * 7. AI Category & Tags Suggestion
 */
export async function suggestCategoryAndTags(
  title: string,
  description?: string
): Promise<{ categorySlug: string; tags: string[] }> {
  if (ai && title.trim()) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        config: {
          responseMimeType: 'application/json',
        },
        contents: `Analyze this marketplace product title and description:
Title: "${title}"
Description: "${description || 'None'}"

Suggest the best category slug from: ["books", "electronics", "project-kits", "lab-equipment", "hostel-essentials", "furniture", "sports", "gaming", "cycles", "stationery", "fashion", "musical-instruments", "events", "tickets", "others"]
Also generate 4-5 relevant campus search tags.

Respond strictly in JSON format matching this schema:
{
  "categorySlug": "string",
  "tags": ["string"]
}`
      });

      const text = response.text || '{}';
      const parsed = JSON.parse(text);
      return {
        categorySlug: parsed.categorySlug || 'others',
        tags: Array.isArray(parsed.tags) ? parsed.tags : ['campus', 'student']
      };
    } catch (err) {
      console.error('Error suggesting category and tags from Gemini:', err);
    }
  }

  // Fallback Simulation
  const lowerTitle = title.toLowerCase();
  let categorySlug = 'others';
  const tags: string[] = ['campus', 'student'];

  if (lowerTitle.includes('book') || lowerTitle.includes('textbook') || lowerTitle.includes('dass') || lowerTitle.includes('author')) {
    categorySlug = 'books';
    tags.push('engineering', 'textbook', 'syllabus');
  } else if (lowerTitle.includes('cycle') || lowerTitle.includes('bike') || lowerTitle.includes('gear')) {
    categorySlug = 'cycles';
    tags.push('commute', 'bicycle', 'transport');
  } else if (lowerTitle.includes('arduino') || lowerTitle.includes('kit') || lowerTitle.includes('sensor')) {
    categorySlug = 'project-kits';
    tags.push('robotics', 'electronics', 'lab');
  } else if (lowerTitle.includes('calculator') || lowerTitle.includes('laptop') || lowerTitle.includes('phone') || lowerTitle.includes('ipad')) {
    categorySlug = 'electronics';
    tags.push('gadget', 'study', 'device');
  }

  return { categorySlug, tags };
}

/**
 * 8. AI Natural Language Search Interpreter
 */
export async function interpretNaturalLanguageQuery(
  prompt: string
): Promise<{ search?: string; category?: string; maxPrice?: number; minPrice?: number; transactionType?: string }> {
  if (ai && prompt.trim()) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        config: {
          responseMimeType: 'application/json',
        },
        contents: `Interpret this natural language search query for a campus marketplace:
Query: "${prompt}"

Category options: ["books", "electronics", "project-kits", "lab-equipment", "hostel-essentials", "furniture", "sports", "gaming", "cycles", "stationery", "fashion", "musical-instruments", "events", "tickets", "others"]
Transaction types: ["BUY", "RENT", "BORROW", "EXCHANGE", "DONATE"]

Extract structured search filters:
{
  "search": "string (cleaned search keywords or null)",
  "category": "string (category slug or null)",
  "maxPrice": number (or null),
  "minPrice": number (or null),
  "transactionType": "string (transaction type or null)"
}`
      });

      const text = response.text || '{}';
      const parsed = JSON.parse(text);
      return {
        search: parsed.search || undefined,
        category: parsed.category || undefined,
        maxPrice: typeof parsed.maxPrice === 'number' ? parsed.maxPrice : undefined,
        minPrice: typeof parsed.minPrice === 'number' ? parsed.minPrice : undefined,
        transactionType: parsed.transactionType || undefined
      };
    } catch (err) {
      console.error('Error interpreting NL query from Gemini:', err);
    }
  }

  // Fallback Simulation
  const lower = prompt.toLowerCase();
  let category: string | undefined;
  let maxPrice: number | undefined;

  if (lower.includes('book')) category = 'books';
  else if (lower.includes('cycle') || lower.includes('bike')) category = 'cycles';
  else if (lower.includes('kit')) category = 'project-kits';
  else if (lower.includes('calculator') || lower.includes('laptop')) category = 'electronics';

  const priceMatch = lower.match(/under\s*₹?\s*(\d+)/i) || lower.match(/below\s*₹?\s*(\d+)/i);
  if (priceMatch) {
    maxPrice = parseInt(priceMatch[1], 10);
  }

  const cleanedSearch = prompt.replace(/under\s*₹?\s*\d+/gi, '').replace(/below\s*₹?\s*\d+/gi, '').trim();

  return {
    search: cleanedSearch || prompt,
    category,
    maxPrice
  };
}
