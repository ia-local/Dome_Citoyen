/**
 * DÔME CITOYEN - STATS VIEWER
 * Récupère les données du registre votes.json pour affichage public
 */

async function updateLiveStats() {
    try {
        const response = await fetch('http://localhost:2026/api/votes/stats');
        const stats = await response.json();

        // Mise à jour du compteur global dans le header
        const statusBar = document.querySelector('.status-bar');
        if (statusBar) {
            statusBar.innerHTML = `VOTES ENREGISTRÉS: ${stats.total} | KERNEL LEVEL: ${stats.kernel_level}`;
        }

        // Mise à jour de la jauge de Majorité Absolue si présente
        const gauge = document.getElementById('majority-gauge');
        if (gauge) {
            const percentage = (stats.total / 45000000) * 100; // Seuil théorique
            gauge.style.width = `${percentage}%`;
            document.getElementById('percentage-text').innerText = `${percentage.toFixed(4)}% vers la Majorité Absolue`;
        }

    } catch (error) {
        console.error("Erreur de synchronisation des statistiques:", error);
    }
}

// Rafraîchissement automatique toutes les 30 secondes
setInterval(updateLiveStats, 30000);
document.addEventListener('DOMContentLoaded', updateLiveStats);