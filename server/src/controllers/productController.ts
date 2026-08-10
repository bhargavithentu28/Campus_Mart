import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth';
import { isMockDB } from '../config/db';
import Product from '../models/Product';
import User from '../models/User';
import Report from '../models/Report';
import { mockProducts, mockUsers, mockReports } from '../config/mockStore';
import { generateProductDescription, predictPrice, moderateListing } from '../services/gemini';

/**
 * AI Smart Search & Filter Products
 */
export async function getAllProducts(req: AuthenticatedRequest, res: Response) {
  try {
    const { search, category, condition, minPrice, maxPrice, sort, isSold } = req.query;

    let parsedSearch = (search as string) || '';
    let parsedCategory = (category as string) || '';
    let parsedCondition = (condition as string) || '';
    let parsedMinPrice = minPrice ? parseFloat(minPrice as string) : 0;
    let parsedMaxPrice = maxPrice ? parseFloat(maxPrice as string) : Infinity;
    let parsedSort = (sort as string) || 'latest';
    let filterSold = isSold === 'true';

    // AI Semantic Natural Language Search Parsing
    // e.g. "I need a geared cycle under 5000" or "laptop for coding under 30000"
    if (parsedSearch) {
      const lowerQuery = parsedSearch.toLowerCase();
      
      // Parse pricing constraints from natural text
      const underMatch = lowerQuery.match(/(?:under|below|less than|within)\s*(?:rs\.?|₹|inr)?\s*([0-9,]+)/i);
      if (underMatch && underMatch[1]) {
        const parsedVal = parseFloat(underMatch[1].replace(/,/g, ''));
        if (!isNaN(parsedVal)) {
          parsedMaxPrice = parsedVal;
          // Strip price filter from search text to focus keyword queries
          parsedSearch = parsedSearch.replace(underMatch[0], '').trim();
        }
      }

      // Parse categories from natural text
      const categoriesList = ['cycles', 'electronics', 'books', 'furniture', 'lab equipment', 'notes', 'fashion', 'sports', 'stationery', 'hostel essentials'];
      for (const cat of categoriesList) {
        if (lowerQuery.includes(cat)) {
          parsedCategory = cat.charAt(0).toUpperCase() + cat.slice(1);
          parsedSearch = parsedSearch.replace(new RegExp(cat, 'gi'), '').trim();
          break;
        }
      }
    }

    if (isMockDB) {
      let filtered = [...mockProducts];

      // Filters
      if (filterSold) {
        filtered = filtered.filter(p => p.isSold);
      } else {
        filtered = filtered.filter(p => !p.isSold);
      }

      if (parsedCategory) {
        filtered = filtered.filter(p => p.category.toLowerCase() === parsedCategory.toLowerCase());
      }

      if (parsedCondition) {
        filtered = filtered.filter(p => p.condition.toLowerCase() === parsedCondition.toLowerCase());
      }

      if (parsedMinPrice > 0) {
        filtered = filtered.filter(p => p.price >= parsedMinPrice);
      }

      if (parsedMaxPrice !== Infinity) {
        filtered = filtered.filter(p => p.price <= parsedMaxPrice);
      }

      if (parsedSearch) {
        const queryWords = parsedSearch.toLowerCase().split(/\s+/).filter(w => w.length > 1);
        filtered = filtered.filter(p => {
          const title = p.title.toLowerCase();
          const desc = p.description.toLowerCase();
          return queryWords.some(word => title.includes(word) || desc.includes(word));
        });
      }

      // Sorting
      if (parsedSort === 'price_asc') {
        filtered.sort((a, b) => a.price - b.price);
      } else if (parsedSort === 'price_desc') {
        filtered.sort((a, b) => b.price - a.price);
      } else if (parsedSort === 'popular') {
        filtered.sort((a, b) => b.viewsCount - a.viewsCount);
      } else {
        // latest
        filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      }

      // Map mock user details
      const populated = filtered.map(p => {
        const sellerObj = mockUsers.find(u => u._id === p.seller) || mockUsers[0];
        return { ...p, seller: sellerObj };
      });

      return res.status(200).json({ success: true, count: populated.length, products: populated });
    } else {
      // Mongoose DB path
      const queryObj: any = {};

      if (filterSold) {
        queryObj.isSold = true;
      } else {
        queryObj.isSold = false;
      }

      if (parsedCategory) {
        queryObj.category = { $regex: new RegExp(`^${parsedCategory}$`, 'i') };
      }

      if (parsedCondition) {
        queryObj.condition = parsedCondition;
      }

      if (parsedMinPrice > 0 || parsedMaxPrice !== Infinity) {
        queryObj.price = {};
        if (parsedMinPrice > 0) queryObj.price.$gte = parsedMinPrice;
        if (parsedMaxPrice !== Infinity) queryObj.price.$lte = parsedMaxPrice;
      }

      if (parsedSearch) {
        queryObj.$or = [
          { title: { $regex: parsedSearch, $options: 'i' } },
          { description: { $regex: parsedSearch, $options: 'i' } }
        ];
      }

      let query = Product.find(queryObj).populate('seller', '-password');

      if (parsedSort === 'price_asc') {
        query = query.sort({ price: 1 });
      } else if (parsedSort === 'price_desc') {
        query = query.sort({ price: -1 });
      } else if (parsedSort === 'popular') {
        query = query.sort({ viewsCount: -1 });
      } else {
        query = query.sort({ createdAt: -1 });
      }

      const products = await query;
      return res.status(200).json({ success: true, count: products.length, products });
    }
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * Get Product Details By ID
 */
export async function getProductById(req: AuthenticatedRequest, res: Response) {
  const { id } = req.params;

  try {
    if (isMockDB) {
      const prodIndex = mockProducts.findIndex(p => p._id === id);
      if (prodIndex === -1) {
        return res.status(404).json({ success: false, message: 'Product listing not found.' });
      }

      // Increment view counter
      mockProducts[prodIndex].viewsCount += 1;

      const product = mockProducts[prodIndex];
      const sellerObj = mockUsers.find(u => u._id === product.seller) || mockUsers[0];

      return res.status(200).json({
        success: true,
        product: { ...product, seller: sellerObj }
      });
    } else {
      const product = await Product.findByIdAndUpdate(
        id,
        { $inc: { viewsCount: 1 } },
        { new: true }
      ).populate('seller', '-password');

      if (!product) {
        return res.status(404).json({ success: false, message: 'Product listing not found.' });
      }

      return res.status(200).json({ success: true, product });
    }
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * Create a new product listing (runs AI checks)
 */
export async function createProduct(req: AuthenticatedRequest, res: Response) {
  const sellerId = req.user?.id;
  const { title, description, price, condition, category, images, pickupLocation, pickupTime, isNegotiable } = req.body;

  if (!title || !price || !category) {
    return res.status(400).json({ success: false, message: 'Title, Price, and Category are required.' });
  }

  try {
    // 1. Trigger Scam analysis
    const moderation = await moderateListing(title, description || '', price, category);

    // 2. Trigger Price evaluation
    const pricingPrediction = await predictPrice(title, category, condition, price);

    const defaultImages = images && images.length > 0 ? images : [
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600" // premium watch placeholder fallback
    ];

    const aiAnalysis = {
      recommendedPrice: pricingPrediction.recommendedPrice,
      quickSalePrice: pricingPrediction.quickSalePrice,
      scamScore: moderation.scamScore,
      aiSummary: pricingPrediction.explanation,
      isFlagged: moderation.isFlagged
    };

    if (isMockDB) {
      const newProduct: any = {
        _id: `p_${Date.now()}`,
        title,
        description: description || 'No description provided.',
        price: parseFloat(price),
        condition: condition || 'Good',
        category,
        images: defaultImages,
        seller: sellerId || 'u_1',
        pickupLocation: pickupLocation || 'Main Campus Gate',
        pickupTime: pickupTime || 'Contact seller',
        isNegotiable: !!isNegotiable,
        isSold: false,
        viewsCount: 0,
        likesCount: 0,
        aiAnalysis,
        createdAt: new Date()
      };

      mockProducts.push(newProduct);
      return res.status(201).json({ success: true, product: newProduct, message: 'Listing posted successfully.' });
    } else {
      const newProduct = new Product({
        title,
        description: description || 'No description provided.',
        price: parseFloat(price),
        condition: condition || 'Good',
        category,
        images: defaultImages,
        seller: sellerId,
        pickupLocation: pickupLocation || 'Main Campus Gate',
        pickupTime: pickupTime || 'Contact seller',
        isNegotiable: !!isNegotiable,
        aiAnalysis
      });

      await newProduct.save();
      const populated = await newProduct.populate('seller', '-password');
      return res.status(201).json({ success: true, product: populated, message: 'Listing posted successfully.' });
    }
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * Like / Save Product
 */
export async function toggleLikeProduct(req: AuthenticatedRequest, res: Response) {
  const { id } = req.params;

  try {
    if (isMockDB) {
      const index = mockProducts.findIndex(p => p._id === id);
      if (index === -1) return res.status(404).json({ success: false, message: 'Product not found.' });

      mockProducts[index].likesCount += 1;
      return res.status(200).json({ success: true, likesCount: mockProducts[index].likesCount, message: 'Wishlisted!' });
    } else {
      const product = await Product.findByIdAndUpdate(
        id,
        { $inc: { likesCount: 1 } },
        { new: true }
      );
      if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });
      return res.status(200).json({ success: true, likesCount: product.likesCount, message: 'Wishlisted!' });
    }
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * Flag / Report Listing
 */
export async function reportProduct(req: AuthenticatedRequest, res: Response) {
  const reporterId = req.user?.id;
  const { productId, reason } = req.body;

  if (!productId || !reason) {
    return res.status(400).json({ success: false, message: 'Product ID and Reason are required.' });
  }

  try {
    if (isMockDB) {
      const newReport = {
        _id: `r_${Date.now()}`,
        reporter: reporterId || 'u_1',
        reportedProduct: productId,
        reason,
        status: 'pending' as const,
        createdAt: new Date()
      };
      mockReports.push(newReport);
      
      // Update product scam score slightly
      const pIndex = mockProducts.findIndex(p => p._id === productId);
      if (pIndex !== -1) {
        mockProducts[pIndex].aiAnalysis.scamScore = Math.min(100, mockProducts[pIndex].aiAnalysis.scamScore + 25);
        if (mockProducts[pIndex].aiAnalysis.scamScore >= 70) {
          mockProducts[pIndex].aiAnalysis.isFlagged = true;
        }
      }

      return res.status(201).json({ success: true, message: 'Thank you for reporting. Product flagged for moderator review.' });
    } else {
      const newReport = new Report({
        reporter: reporterId,
        reportedProduct: productId,
        reason
      });
      await newReport.save();

      // Flag product locally in mongoose
      await Product.findByIdAndUpdate(productId, {
        $inc: { 'aiAnalysis.scamScore': 25 },
        $set: { 'aiAnalysis.isFlagged': true }
      });

      return res.status(201).json({ success: true, message: 'Product flagged for moderator review.' });
    }
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * AI Endpoint: Generate Description
 */
export async function apiGenerateDescription(req: AuthenticatedRequest, res: Response) {
  const { title, category, condition, specifications } = req.body;
  if (!title || !category || !condition) {
    return res.status(400).json({ success: false, message: 'Title, Category, and Condition are required.' });
  }

  try {
    const desc = await generateProductDescription(title, category, condition, specifications);
    return res.status(200).json({ success: true, description: desc });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * AI Endpoint: Predict Price
 */
export async function apiPredictPrice(req: AuthenticatedRequest, res: Response) {
  const { title, category, condition, price } = req.body;
  if (!title || !category || !condition || !price) {
    return res.status(400).json({ success: false, message: 'All details (Title, Category, Condition, Proposed Price) are required.' });
  }

  try {
    const data = await predictPrice(title, category, condition, parseFloat(price));
    return res.status(200).json({ success: true, ...data });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * Mark Listing as Sold
 */
export async function markProductSold(req: AuthenticatedRequest, res: Response) {
  const { id } = req.params;
  const sellerId = req.user?.id;

  try {
    if (isMockDB) {
      const pIndex = mockProducts.findIndex(p => p._id === id);
      if (pIndex === -1) return res.status(404).json({ success: false, message: 'Product not found.' });
      
      if (mockProducts[pIndex].seller !== sellerId) {
        return res.status(403).json({ success: false, message: 'Not authorized to modify this listing.' });
      }

      mockProducts[pIndex].isSold = true;
      return res.status(200).json({ success: true, message: 'Product marked as sold.' });
    } else {
      const product = await Product.findOne({ _id: id, seller: sellerId });
      if (!product) return res.status(404).json({ success: false, message: 'Product not found or unauthorized.' });

      product.isSold = true;
      await product.save();
      return res.status(200).json({ success: true, message: 'Product marked as sold.', product });
    }
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}
