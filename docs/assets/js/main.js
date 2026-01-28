/**
 * DÔME CITOYEN - KERNEL UI CONTROLLER
 * Logiciel de gestion des requêtes AGI et du routage
 */

const DOMAIN = 'http://localhost:2026';

/**
 * Envoie une requête au KERNEL via Groq-SDK
 * @param {string} task - La tâche à accomplir (ex: 'voter')
 * @param {string} context - Le contexte juridique ou scientifique
 */
async function triggerAGI(task, context) {
    const aiLogElement = document.getElementById('ai-logs');
    
    // Feedback visuel immédiat dans l'interface
    if (aiLogElement) {
        aiLogElement.innerHTML += `\n[REQUEST]: ${task}...`;
    }

    try {
        const response = await fetch(`${DOMAIN}/api/agi-request`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ task, context })
        });

        if (!response.ok) throw new Error('Erreur de connexion au KERNEL');

        const data = await response.json();

        // Mise à jour de la console AGI si elle existe sur la page
        if (aiLogElement) {
            aiLogElement.innerHTML += `\n[AGI_RESPONSE]: ${data.response}`;
            aiLogElement.scrollTop = aiLogElement.scrollHeight;
        }

        return data;
    } catch (error) {
        console.error('Erreur AGI:', error);
        if (aiLogElement) aiLogElement.innerHTML += `\n[ERROR]: ${error.message}`;
    }
}

/**
 * Gestionnaire spécifique pour les votes citoyens
 */
async function processVote(voteID, description) {
    const confirmation = confirm(`Confirmez-vous votre signature pour : ${description} ?`);
    
    if (confirmation) {
        const result = await triggerAGI(
            `Enregistrement du vote: ${voteID}`,
            `L'utilisateur vote contre l'usage des armes biochimiques selon les articles 421-2 et 421-4.`
        );
        
        if (result && result.status === "SUCCESS") {
            alert("Vote enregistré avec succès dans le registre KERNEL.");
        }
    }
}

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
    console.log("Dôme Citoyen - Interface prête sur le port 2026.");
});