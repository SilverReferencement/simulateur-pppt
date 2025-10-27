// Simulateur PPPT - Calculateur de Prix
// Version 1.1 - Test du système d'archivage automatique
// Configuration
const GOOGLE_SHEET_ID = '1nLBmI7uV6v48fq5zqxsYLqSN1EBCsxAfowQI7rxROyQ';
const SHEET_NAME = 'Feuille 1';

// État de l'application
let pricingData = [];
let currentLots = 1;
let includeDPE = false;

// Éléments DOM
const lotsSlider = document.getElementById('lots-slider');
const lotsDisplay = document.getElementById('lots-display');
const sliderProgress = document.getElementById('slider-progress');
const dpeToggle = document.getElementById('dpe-toggle');
const priceDisplay = document.getElementById('price-display');
const priceDetails = document.getElementById('price-details');
const tierInfo = document.getElementById('tier-info');
const unitPrice = document.getElementById('unit-price');
const dataStatus = document.getElementById('data-status');
const pricingTiers = document.getElementById('pricing-tiers');
const quoteBtn = document.getElementById('quote-btn');
const refreshBtn = document.getElementById('refresh-btn');

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    setupEventListeners();
});

/**
 * Initialisation de l'application
 */
async function initializeApp() {
    try {
        await loadPricingData();
        updateSliderProgress();
        calculateAndDisplayPrice();
        displayPricingTiers();
        updateDataStatus('success', 'Tarifs chargés avec succès');
    } catch (error) {
        console.error('Erreur lors de l\'initialisation:', error);
        updateDataStatus('error', 'Erreur de chargement des tarifs');
        // Utiliser des données par défaut en cas d'erreur
        useFallbackData();
    }
}

/**
 * Configuration des écouteurs d'événements
 */
function setupEventListeners() {
    lotsSlider.addEventListener('input', (e) => {
        currentLots = parseInt(e.target.value);
        lotsDisplay.textContent = currentLots;
        updateSliderProgress();
        calculateAndDisplayPrice();
    });

    dpeToggle.addEventListener('change', (e) => {
        includeDPE = e.target.checked;
        calculateAndDisplayPrice();
    });

    quoteBtn.addEventListener('click', downloadQuote);
    refreshBtn.addEventListener('click', resetSimulator);
}

/**
 * Chargement des données depuis Google Sheets
 */
async function loadPricingData() {
    updateDataStatus('loading', 'Chargement des tarifs...');

    try {
        // URL pour récupérer les données en CSV
        const url = `https://docs.google.com/spreadsheets/d/${GOOGLE_SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(SHEET_NAME)}`;

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error('Erreur lors du chargement des données');
        }

        const csvText = await response.text();
        pricingData = parseCSV(csvText);

        console.log('Données chargées:', pricingData);

        if (pricingData.length === 0) {
            throw new Error('Aucune donnée trouvée');
        }

    } catch (error) {
        console.error('Erreur de chargement:', error);
        throw error;
    }
}

/**
 * Parser CSV en données utilisables
 */
function parseCSV(csv) {
    const lines = csv.split('\n').filter(line => line.trim());
    const data = [];

    // Ignorer la première ligne (en-têtes)
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].replace(/"/g, '').trim();
        if (!line) continue;

        const values = line.split(',');

        if (values.length >= 4) {
            const lotsMin = parseInt(values[0]);
            const lotsMax = parseInt(values[1]);
            const prixSansDPE = parseFloat(values[2]);
            const prixAvecDPE = parseFloat(values[3]);

            if (!isNaN(lotsMin) && !isNaN(lotsMax) && !isNaN(prixSansDPE) && !isNaN(prixAvecDPE)) {
                data.push({
                    lotsMin,
                    lotsMax,
                    prixSansDPE,
                    prixAvecDPE
                });
            }
        }
    }

    return data;
}

/**
 * Utiliser des données par défaut en cas d'erreur
 */
function useFallbackData() {
    pricingData = [
        { lotsMin: 1, lotsMax: 20, prixSansDPE: 990, prixAvecDPE: 2490 },
        { lotsMin: 21, lotsMax: 40, prixSansDPE: 1490, prixAvecDPE: 3490 }
    ];
    calculateAndDisplayPrice();
    displayPricingTiers();
}

/**
 * Calcul du prix en fonction du nombre de lots et de l'option DPE
 */
function calculatePrice(lots, withDPE) {
    // Trouver la tranche dans les données du tableau
    const tier = pricingData.find(t => lots >= t.lotsMin && lots <= t.lotsMax);

    if (tier) {
        // Le nombre de lots est dans une tranche du tableau
        return withDPE ? tier.prixAvecDPE : tier.prixSansDPE;
    }

    // Pour les lots au-delà du tableau
    const maxTier = pricingData[pricingData.length - 1];
    const maxLotsInTable = maxTier.lotsMax;

    if (lots > maxLotsInTable) {
        // Calcul pour plus de 40 lots (ou le max du tableau)
        // Prix maximum : 4990€ sans DPE à 250+ lots, 7490€ avec DPE à 250+ lots

        const maxLots = 250;
        const priceAtMaxTier = withDPE ? maxTier.prixAvecDPE : maxTier.prixSansDPE;
        const priceAtMaxLots = withDPE ? 7490 : 4990;

        if (lots >= maxLots) {
            return priceAtMaxLots;
        }

        // Interpolation linéaire entre le max du tableau et 250 lots
        const lotRange = maxLots - maxLotsInTable;
        const priceRange = priceAtMaxLots - priceAtMaxTier;
        const lotsDifference = lots - maxLotsInTable;

        const interpolatedPrice = priceAtMaxTier + (priceRange * lotsDifference / lotRange);

        return Math.round(interpolatedPrice);
    }

    // Par défaut (ne devrait pas arriver)
    return withDPE ? pricingData[0].prixAvecDPE : pricingData[0].prixSansDPE;
}

/**
 * Calcul et affichage du prix
 */
function calculateAndDisplayPrice() {
    const price = calculatePrice(currentLots, includeDPE);
    const unitPriceValue = (price / currentLots).toFixed(2);

    // Mise à jour du prix
    priceDisplay.textContent = `${price.toLocaleString('fr-FR')} €`;

    // Mise à jour des badges
    const dpeBadge = includeDPE
        ? '<span class="detail-badge">Avec DPE</span>'
        : '<span class="detail-badge">Sans DPE</span>';
    const lotsInfo = `<span class="detail-info">${currentLots} lot${currentLots > 1 ? 's' : ''}</span>`;
    priceDetails.innerHTML = dpeBadge + lotsInfo;

    // Mise à jour des informations de tranche
    const tier = pricingData.find(t => currentLots >= t.lotsMin && currentLots <= t.lotsMax);
    if (tier) {
        tierInfo.textContent = `${tier.lotsMin} - ${tier.lotsMax} lots`;
    } else {
        const maxTier = pricingData[pricingData.length - 1];
        if (currentLots > maxTier.lotsMax) {
            tierInfo.textContent = `Plus de ${maxTier.lotsMax} lots`;
        }
    }

    unitPrice.textContent = `${unitPriceValue} €/lot`;

    // Animation du prix
    priceDisplay.style.transform = 'scale(1.05)';
    setTimeout(() => {
        priceDisplay.style.transform = 'scale(1)';
    }, 200);
}

/**
 * Mise à jour de la progression du slider
 */
function updateSliderProgress() {
    const min = parseInt(lotsSlider.min);
    const max = parseInt(lotsSlider.max);
    const value = parseInt(lotsSlider.value);

    const percentage = ((value - min) / (max - min)) * 100;
    sliderProgress.style.width = `${percentage}%`;
}

/**
 * Affichage des tranches tarifaires
 */
function displayPricingTiers() {
    if (pricingData.length === 0) return;

    const tiersHTML = pricingData.map(tier => `
        <li>
            <strong>${tier.lotsMin} - ${tier.lotsMax} lots :</strong>
            ${tier.prixSansDPE}€ sans DPE, ${tier.prixAvecDPE}€ avec DPE
        </li>
    `).join('');

    const maxTier = pricingData[pricingData.length - 1];
    const additionalTiers = `
        <li>
            <strong>Plus de ${maxTier.lotsMax} lots :</strong>
            Tarif progressif jusqu'à 4990€ sans DPE (250 lots)
        </li>
        <li>
            <strong>Plus de 250 lots avec DPE :</strong>
            Tarif plafonné à 7490€
        </li>
    `;

    pricingTiers.innerHTML = tiersHTML + additionalTiers;
}

/**
 * Mise à jour du statut des données
 */
function updateDataStatus(status, message) {
    const statusDot = dataStatus.querySelector('.status-dot');
    const statusText = dataStatus.querySelector('.status-text');

    statusDot.className = 'status-dot';
    statusText.textContent = message;

    if (status === 'loading') {
        statusDot.classList.add('loading');
        dataStatus.style.background = '#fef3c7';
        dataStatus.style.borderColor = '#fcd34d';
        statusText.style.color = '#78350f';
    } else if (status === 'success') {
        dataStatus.style.background = '#f0fdf4';
        dataStatus.style.borderColor = '#86efac';
        statusText.style.color = '#166534';
    } else if (status === 'error') {
        dataStatus.style.background = '#fef2f2';
        dataStatus.style.borderColor = '#fca5a5';
        statusText.style.color = '#991b1b';
    }
}

/**
 * Téléchargement du devis
 */
function downloadQuote() {
    const price = calculatePrice(currentLots, includeDPE);
    const date = new Date().toLocaleDateString('fr-FR');

    const quoteContent = `
DEVIS PPPT
==========

Date: ${date}
Nombre de lots: ${currentLots}
Option DPE: ${includeDPE ? 'Oui' : 'Non'}

Prix total: ${price.toLocaleString('fr-FR')} €
Prix unitaire moyen: ${(price / currentLots).toFixed(2)} €/lot

---
Tarifs valables à la date du ${date}
Ce devis est généré automatiquement et n'a pas de valeur contractuelle.
Pour un devis officiel, veuillez contacter notre service commercial.
    `.trim();

    const blob = new Blob([quoteContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `devis_pppt_${currentLots}lots_${date.replace(/\//g, '-')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    // Animation du bouton
    quoteBtn.style.transform = 'scale(0.95)';
    setTimeout(() => {
        quoteBtn.style.transform = 'scale(1)';
    }, 150);
}

/**
 * Réinitialisation du simulateur
 */
function resetSimulator() {
    currentLots = 1;
    includeDPE = false;

    lotsSlider.value = 1;
    lotsDisplay.textContent = 1;
    dpeToggle.checked = false;

    updateSliderProgress();
    calculateAndDisplayPrice();

    // Animation du bouton
    refreshBtn.style.transform = 'rotate(180deg)';
    setTimeout(() => {
        refreshBtn.style.transform = 'rotate(0deg)';
    }, 300);
}

// Transition douce pour le prix
priceDisplay.style.transition = 'transform 200ms cubic-bezier(0.4, 0, 0.2, 1)';
