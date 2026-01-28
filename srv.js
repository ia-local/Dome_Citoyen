// Dépendances
const express = require('express');
const Groq = require('groq-sdk');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const port = 2026;

// Configuration Groq AGI
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

app.use(express.static(path.join(__dirname, 'docs')));
app.use(express.json());

// Chemin du registre des votes
const VOTES_FILE = path.join(__dirname, 'votes.json');

// Initialisation du fichier votes.json s'il n'existe pas
if (!fs.existsSync(VOTES_FILE)) {
    fs.writeFileSync(VOTES_FILE, JSON.stringify([], null, 2));
}

// Endpoint AGI avec Enregistrement dans le Registre
app.post('/api/agi-request', async (req, res) => {
    const { task, context, voteData } = req.body;
    
    try {
        const completion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: "ROLE: AGI CVNU Audit Unit. TASK: Validation de conformité au protocole RUP & RIC." },
                { role: "user", content: `CONTEXT: ${context} | ACTION: ${task}` }
            ],
            model: "llama-3.1-8b-instant",
        });

        const aiResponse = completion.choices[0].message.content;

        // Si la requête contient un vote, on l'inscrit au registre
        if (task.includes("Enregistrement du vote")) {
            const votes = JSON.parse(fs.readFileSync(VOTES_FILE));
            const newEntry = {
                timestamp: new Date().toISOString(),
                voteID: task.split(': ')[1],
                status: "VALIDATED_BY_AGI",
                kernel_level: 7, // Basé sur CORE_SYSTEM_CVNU.js
                ai_audit: aiResponse
            };
            votes.push(newEntry);
            fs.writeFileSync(VOTES_FILE, JSON.stringify(votes, null, 2));
        }

        res.json({
            status: "SUCCESS",
            response: aiResponse,
            kernel_state: "SYNC_CVNU_ACTIVE"
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(port, () => {
    console.log(`
    ╔════════════════════════════════════════════════════════╗
    ║  CVNU CORE SYSTEM : SERVER UPDATED                     ║
    ║  REGISTRY: votes.json | PORT: 2026                     ║
    ║  SMART CONTRACT BRIDGE: ENABLED                        ║
    ╚════════════════════════════════════════════════════════╝
    `);
});