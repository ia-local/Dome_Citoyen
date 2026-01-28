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

/**
 * GESTION DU REGISTRE DES VOTES (CRUD)
 */

// CREATE : Enregistrement d'un nouveau vote (Déjà implémenté)
// READ : Récupération des statistiques pour la Majority Absolute
app.get('/api/votes/stats', (req, res) => {
    try {
        const votes = JSON.parse(fs.readFileSync(VOTES_FILE));
        const stats = {
            total: votes.length,
            bio_oui: votes.filter(v => v.voteID === 'RIC_BIO_OUI').length,
            adm_oui: votes.filter(v => v.voteID === 'RIC_ADM_OUI').length,
            kernel_level: 7 // Invariant CORE_SYSTEM_CVNU
        };
        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: "Erreur de lecture du registre" });
    }
});

// UPDATE : Annotation par l'AGI (Audit de conformité)
app.patch('/api/votes/audit/:index', async (req, res) => {
    // Permet à la commission d'ajouter une note d'enquête sur un vote spécifique
});
/**
 * DÔME CITOYEN - PDF GENERATOR
 * Transforme le HTML Sémantique en document d'instruction
 */

// Fonction pour compiler les données du citoyen dans le modèle de lettre
async function generateLegalDocument(citizenData) {
    const templatePath = path.join(__dirname, 'docs/composition-penale/lettre-procureur.html');
    let htmlContent = fs.readFileSync(templatePath, 'utf8');

    // Remplacement des variables sémantiques par les données du KERNEL
    htmlContent = htmlContent
        .replace('[NOM_CITOYEN]', citizenData.name || 'ANONYME (ART. 41 CPP)')
        .replace('[VILLE]', citizenData.city || 'NON SPÉCIFIÉ')
        .replace('[DATE]', new Date().toLocaleDateString('fr-FR'));

    // Injection de la preuve numérique (hash du registre votes.json)
    const registryHash = Buffer.from(fs.readFileSync('votes.json')).toString('base64').substring(0, 16);
    htmlContent = htmlContent.replace('[HASH_PREUVE]', registryHash);

    return htmlContent;
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