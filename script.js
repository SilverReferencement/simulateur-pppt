// Simulateur PPPT - Calculateur de Prix
// Version 2.0 - Avec formulaire email
// Configuration
const GOOGLE_SHEET_ID = '1nLBmI7uV6v48fq5zqxsYLqSN1EBCsxAfowQI7rxROyQ';
const SHEET_NAME = 'Feuille 1';

// État de l'application
let pricingData = [];
let currentLots = 1;
let includeDPE = false;
let currentBuildings = 1;

// Éléments DOM
const lotsSlider = document.getElementById('lots-slider');
const lotsDisplay = document.getElementById('lots-display');
const sliderProgress = document.getElementById('slider-progress');
const dpeToggle = document.getElementById('dpe-toggle');
const priceDisplay = document.getElementById('price-display');
const priceInfo = document.getElementById('price-info');
const buildingBtns = document.querySelectorAll('.building-btn');
const emailQuoteBtn = document.getElementById('email-quote-btn');
const emailForm = document.getElementById('email-form');
const submitQuoteBtn = document.getElementById('submit-quote-btn');
const emailInput = document.getElementById('email-input');
const dpeInput = document.getElementById('dpe-input');

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
    } catch (error) {
        console.error('Erreur lors de l\'initialisation:', error);
        // Utiliser des données par défaut en cas d'erreur
        useFallbackData();
    }
}

/**
 * Configuration des écouteurs d'événements
 */
function setupEventListeners() {
    // Slider de lots
    lotsSlider.addEventListener('input', (e) => {
        currentLots = parseInt(e.target.value);
        lotsDisplay.textContent = currentLots;
        updateSliderProgress();
        calculateAndDisplayPrice();
    });

    // Toggle DPE
    dpeToggle.addEventListener('change', (e) => {
        includeDPE = e.target.checked;
        calculateAndDisplayPrice();
    });

    // Sélecteur de bâtiments
    buildingBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Retirer la classe active de tous les boutons
            buildingBtns.forEach(b => b.classList.remove('active'));
            // Ajouter la classe active au bouton cliqué
            btn.classList.add('active');
            // Mettre à jour le nombre de bâtiments
            currentBuildings = parseInt(btn.dataset.buildings);
            calculateAndDisplayPrice();
        });
    });

    // Bouton pour afficher le formulaire email
    emailQuoteBtn.addEventListener('click', () => {
        if (emailForm.style.display === 'none' || emailForm.style.display === '') {
            emailForm.style.display = 'block';
            emailQuoteBtn.textContent = 'Masquer le formulaire';
        } else {
            emailForm.style.display = 'none';
            emailQuoteBtn.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
                Je veux recevoir un devis par email
            `;
        }
    });

    // Bouton de soumission du devis
    submitQuoteBtn.addEventListener('click', () => {
        handleQuoteSubmission();
    });
}

/**
 * Chargement des données depuis Google Sheets
 */
async function loadPricingData() {
    try {
        // URL pour récupérer les données en CSV
        const url = `https://docs.google.com/spreadsheets/d/${GOOGLE_SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(SHEET_NAME)}`;

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error('Erreur lors du chargement des données');
        }

        const csvText = await response.text();
        pricingData = parseCSV(csvText);

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
}

/**
 * Calcul du prix en fonction du nombre de lots et de l'option DPE
 */
function calculatePrice(lots, withDPE, buildings) {
    // Trouver la tranche dans les données du tableau
    const tier = pricingData.find(t => lots >= t.lotsMin && lots <= t.lotsMax);

    let basePrice = 0;

    if (tier) {
        // Le nombre de lots est dans une tranche du tableau
        basePrice = withDPE ? tier.prixAvecDPE : tier.prixSansDPE;
    } else {
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
                basePrice = priceAtMaxLots;
            } else {
                // Interpolation linéaire entre le max du tableau et 250 lots
                const lotRange = maxLots - maxLotsInTable;
                const priceRange = priceAtMaxLots - priceAtMaxTier;
                const lotsDifference = lots - maxLotsInTable;

                basePrice = Math.round(priceAtMaxTier + (priceRange * lotsDifference / lotRange));
            }
        } else {
            // Par défaut (ne devrait pas arriver)
            basePrice = withDPE ? pricingData[0].prixAvecDPE : pricingData[0].prixSansDPE;
        }
    }

    // Multiplier par le nombre de bâtiments
    return basePrice * buildings;
}

/**
 * Calcul et affichage du prix
 */
function calculateAndDisplayPrice() {
    const price = calculatePrice(currentLots, includeDPE, currentBuildings);

    // Mise à jour du prix
    priceDisplay.textContent = `${price.toLocaleString('fr-FR')} €`;

    // Mise à jour des informations
    const dpeText = includeDPE ? 'Avec DPE' : 'Sans DPE';
    const buildingText = currentBuildings === 1 ? '1 immeuble' : `${currentBuildings}${currentBuildings === 3 ? '+' : ''} immeubles`;
    const lotsText = `${currentLots} lot${currentLots > 1 ? 's' : ''}`;

    priceInfo.innerHTML = `<span class="info-text">${dpeText} • ${buildingText} • ${lotsText}</span>`;

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
 * Gestion de la soumission du devis
 */
function handleQuoteSubmission() {
    const email = emailInput.value.trim();
    const dpe = dpeInput.value.trim();

    // Validation basique
    if (!email || !dpe) {
        alert('Veuillez remplir tous les champs');
        return;
    }

    // Validation email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert('Veuillez entrer une adresse email valide');
        return;
    }

    const price = calculatePrice(currentLots, includeDPE, currentBuildings);

    // Créer le contenu du devis
    const quoteData = {
        email: email,
        dpe: dpe,
        lots: currentLots,
        buildings: currentBuildings,
        includeDPE: includeDPE,
        price: price,
        date: new Date().toLocaleDateString('fr-FR')
    };

    // Ici vous pouvez envoyer les données à votre backend
    // Pour l'instant, on simule l'envoi
    console.log('Devis à envoyer:', quoteData);

    // Afficher un message de confirmation
    submitQuoteBtn.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
        Devis envoyé avec succès !
    `;
    submitQuoteBtn.style.background = 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)';

    // Réinitialiser le formulaire après 3 secondes
    setTimeout(() => {
        emailInput.value = '';
        dpeInput.value = '';
        emailForm.style.display = 'none';
        emailQuoteBtn.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
            </svg>
            Je veux recevoir un devis par email
        `;
        submitQuoteBtn.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            Recevoir le devis par email
        `;
        submitQuoteBtn.style.background = 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)';
    }, 3000);
}

// Transition douce pour le prix
priceDisplay.style.transition = 'transform 200ms cubic-bezier(0.4, 0, 0.2, 1)';
