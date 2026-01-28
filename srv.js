// Dépendances : npm install groq-sdk express dotenv
const express = require('express');
const Groq = require('groq-sdk');
const path = require('path');
require('dotenv').config();

const app = express();
const port = 2026;

// Configuration Groq AGI
const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY // Assurez-vous d'avoir votre clé dans le fichier .env
});

// Service du répertoire statique /docs
// Aligné sur : https://github.com/ia-local/Dome_Citoyen/docs
app.use(express.static(path.join(__dirname, 'docs')));
app.use(express.json());

// Endpoint pour les requêtes AGI du Protocole de Vote
app.post('/api/agi-request', async (req, res) => {
    const { task, context } = req.body;
    
    try {
        const completion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: "ROLE: AGI Synthesis Unit. TASK: Analyse de conformité juridique et validation du vote citoyen pour le Dôme." },
                { role: "user", content: `CONTEXT: ${context} | ACTION: ${task}` }
            ],
            model: "llama-3.1-8b-instant", // Modèle ultra-rapide pour le temps réel
        });

        res.json({
            status: "SUCCESS",
            response: completion.choices[0].message.content,
            kernel_state: "ACTIVE_PORT_2026"
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(port, () => {
    console.log(`
    ╔═════════════════════════════════════════════════════╗
    ║  DÔME CITOYEN : KERNEL INITIALIZED                  ║
    ║  PORT: ${port} | REPOSITORY: /docs/                  ║
    ║  STATUS: AGI SYNC ACTIVE (GROQ-SDK)                 ║
    ╚═════════════════════════════════════════════════════╝
    `);
});