import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { Client } from '@notionhq/client';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' })); // Increased limit for potential file data (though we might not send files initially)

// Notion Client
const notion = new Client({ auth: process.env.NOTION_API_KEY });
const DATABASE_ID = process.env.NOTION_DATABASE_ID;

// Helper to format currency
const formatCurrency = (val) => {
    return new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(val);
};

// POST: Submit Inquiry
app.post('/api/inquiry', async (req, res) => {
    try {
        const data = req.body;

        console.log('Received inquiry:', data.name);

        if (!DATABASE_ID) {
            throw new Error('NOTION_DATABASE_ID is not defined in .env');
        }

        // Construct Notion Page Properties
        let messageContent = data.message || '';
        if (data.files && data.files.length > 0) {
            const fileNames = data.files.map(f => f.name).join(', ');
            messageContent += `\n\n[Attached Files]: ${fileNames} (File upload not supported in Notion API yet)`;
        }

        // Construct Notion Page Properties
        const properties = {
            Name: {
                title: [
                    {
                        text: {
                            content: data.name || 'Anonymous'
                        }
                    }
                ]
            },
            Phone: {
                phone_number: data.phone || null
            },
            Email: {
                email: data.email || null
            },
            ServiceType: {
                select: {
                    name: data.serviceType === 'commercial' ? '상업 공간' : '주거 공간'
                }
            },
            SubType: {
                rich_text: [
                    {
                        text: {
                            content: data.subType || ''
                        }
                    }
                ]
            },
            Area: {
                number: parseFloat(data.area) || 0
            },
            // Note: EstimatedCost is optional, check if it exists in schema
            EstimatedCost: {
                number: parseInt(data.estimateStandard) || 0
            },
            Plan: {
                select: {
                    name: data.selectedPlan ? data.selectedPlan.charAt(0).toUpperCase() + data.selectedPlan.slice(1) : 'Standard'
                }
            },
            Message: {
                rich_text: [
                    {
                        text: {
                            content: messageContent
                        }
                    }
                ]
            }
        };

        // If status exists in schema (Status property type)
        if (data.status) {
            properties.Status = {
                status: {
                    name: "New" // Ensure this matches a valid option in Notion Status property
                }
            };
        }

        // Create Page in Notion
        const response = await notion.pages.create({
            parent: { database_id: DATABASE_ID },
            properties: properties,
        });

        console.log('Notion page created:', response.id);

        res.status(200).json({ success: true, message: 'Inquiry saved to Notion', id: response.id });
    } catch (error) {
        console.error('Error saving to Notion:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
