// Simulateur PPPT - Calculateur de Prix
// Version 4.0 - Code postal en haut, nouvelle logique bâtiments
// Configuration
const GOOGLE_SHEET_ID = '1nLBmI7uV6v48fq5zqxsYLqSN1EBCsxAfowQI7rxROyQ';
const SHEET_NAME = 'Feuille 1';
const QUOTES_SHEET_ID = '1GiPN9N2rb4vRqdGamQLPNoC0i7wRQaXAon5D9slf4og';

// Codes postaux Île-de-France (sans astérisque)
const IDF_POSTAL_CODES = ['75', '92', '93', '94', '77', '78', '95'];

// État de l'application
let pricingData = [];
let currentLots = 1;
let includeDPE = false;
let currentBuildings = 1;
let selectedFile = null;

// Éléments DOM
const lotsSlider = document.getElementById('lots-slider');
const lotsInput = document.getElementById('lots-input');
const sliderProgress = document.getElementById('slider-progress');
const dpeToggle = document.getElementById('dpe-toggle');
const priceDisplay = document.getElementById('price-display');
const priceInfo = document.getElementById('price-info');
const priceAsterisk = document.getElementById('price-asterisk');
const asteriskNote = document.getElementById('asterisk-note');
const buildingBtns = document.querySelectorAll('.building-btn');
const emailQuoteBtn = document.getElementById('email-quote-btn');
const emailForm = document.getElementById('email-form');
const submitQuoteBtn = document.getElementById('submit-quote-btn');
const emailInput = document.getElementById('email-input');
const postalCodeMain = document.getElementById('postal-code-main');
const dpeFileInput = document.getElementById('dpe-file-input');
const fileName = document.getElementById('file-name');

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
    // Code postal principal
    if (postalCodeMain) {
        postalCodeMain.addEventListener('input', () => {
            checkAsteriskDisplay();
            calculateAndDisplayPrice();
        });
    }

    // Slider de lots
    lotsSlider.addEventListener('input', (e) => {
        currentLots = parseInt(e.target.value);
        lotsInput.value = currentLots;
        updateSliderProgress();
        calculateAndDisplayPrice();
    });

    // Input manuel des lots
    lotsInput.addEventListener('input', (e) => {
        let value = parseInt(e.target.value) || 1;
        if (value < 1) value = 1;
        if (value > 999) value = 999;

        currentLots = value;

        // Mettre à jour le slider si la valeur est dans la plage
        if (value <= 150) {
            lotsSlider.value = value;
            updateSliderProgress();
        } else {
            lotsSlider.value = 150;
            sliderProgress.style.width = '100%';
        }

        calculateAndDisplayPrice();
    });

    // Toggle DPE
    dpeToggle.addEventListener('change', (e) => {
        includeDPE = e.target.checked;
        calculateAndDisplayPrice();
        checkAsteriskDisplay();
    });

    // Sélecteur de bâtiments
    buildingBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            buildingBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentBuildings = parseInt(btn.dataset.buildings);
            calculateAndDisplayPrice();
        });
    });

    // Upload de fichier
    dpeFileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            selectedFile = file;
            fileName.textContent = file.name;
        } else {
            selectedFile = null;
            fileName.textContent = 'Choisir un fichier PDF/Image';
        }
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
 * Structure attendue: lots_min, lots_max, prix_sans_DPE, prix_avec_DPE, prix_par_ascenseur_supp
 */
function parseCSV(csv) {
    const lines = csv.split('\n').filter(line => line.trim());
    const data = [];

    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].replace(/"/g, '').trim();
        if (!line) continue;

        const values = line.split(',');

        if (values.length >= 4) {
            const lotsMin = parseInt(values[0]);
            const lotsMax = parseInt(values[1]);
            const prixSansDPE = parseFloat(values[2]);
            const prixAvecDPE = parseFloat(values[3]);
            const prixParAscenseurSupp = values[4] ? parseFloat(values[4]) : 0;

            if (!isNaN(lotsMin) && !isNaN(lotsMax) && !isNaN(prixSansDPE) && !isNaN(prixAvecDPE)) {
                data.push({
                    lotsMin,
                    lotsMax,
                    prixSansDPE,
                    prixAvecDPE,
                    prixParAscenseurSupp
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
        { lotsMin: 1, lotsMax: 20, prixSansDPE: 990, prixAvecDPE: 2490, prixParAscenseurSupp: 200 },
        { lotsMin: 21, lotsMax: 40, prixSansDPE: 1490, prixAvecDPE: 3490, prixParAscenseurSupp: 300 },
        { lotsMin: 41, lotsMax: 80, prixSansDPE: 2490, prixAvecDPE: 4990, prixParAscenseurSupp: 400 }
    ];
    calculateAndDisplayPrice();
}

/**
 * Calcul du prix en fonction du nombre de lots, DPE et bâtiments
 * NOUVELLE LOGIQUE BÂTIMENTS:
 * - Bâtiment 1: prix de base
 * - Bâtiments supplémentaires: + prix_par_ascenseur_supp de la colonne E
 * - Si lots > max du tableau: + 100€ par bâtiment supplémentaire
 */
function calculatePrice(lots, withDPE, buildings) {
    const tier = pricingData.find(t => lots >= t.lotsMin && lots <= t.lotsMax);

    let basePrice = 0;
    let additionalBuildingCost = 0;
    let isAboveMaxLots = false;

    if (tier) {
        // Le nombre de lots est dans une tranche du tableau
        basePrice = withDPE ? tier.prixAvecDPE : tier.prixSansDPE;
        additionalBuildingCost = tier.prixParAscenseurSupp || 0;
    } else {
        // Pour les lots au-delà du tableau
        const maxTier = pricingData[pricingData.length - 1];
        const maxLotsInTable = maxTier.lotsMax;

        if (lots > maxLotsInTable) {
            isAboveMaxLots = true;
            // Calcul pour plus de 40 lots (ou le max du tableau)
            // Prix maximum : 4990€ sans DPE à 250+ lots, 7490€ avec DPE à 250+ lots

            const maxLots = 250;
            const priceAtMaxTier = withDPE ? maxTier.prixAvecDPE : maxTier.prixSansDPE;
            const priceAtMaxLots = withDPE ? 7490 : 4990;

            if (lots >= maxLots) {
                basePrice = priceAtMaxLots;
            } else {
                const lotRange = maxLots - maxLotsInTable;
                const priceRange = priceAtMaxLots - priceAtMaxTier;
                const lotsDifference = lots - maxLotsInTable;

                basePrice = Math.round(priceAtMaxTier + (priceRange * lotsDifference / lotRange));
            }

            additionalBuildingCost = (maxTier.prixParAscenseurSupp || 0) + 100;
        } else {
            // Par défaut (ne devrait pas arriver)
            basePrice = withDPE ? pricingData[0].prixAvecDPE : pricingData[0].prixSansDPE;
            additionalBuildingCost = pricingData[0].prixParAscenseurSupp || 0;
        }
    }

    // Calcul du prix total avec bâtiments supplémentaires
    let totalPrice = basePrice;

    if (buildings > 1) {
        const additionalBuildings = buildings - 1;
        totalPrice += additionalBuildings * additionalBuildingCost;
    }

    return totalPrice;
}

/**
 * Vérifier si l'astérisque doit être affiché
 * CORRECTION: Uniquement HORS Île-de-France (pas hors France)
 */
function checkAsteriskDisplay() {
    if (!postalCodeMain) return;

    const postalCode = postalCodeMain.value.trim();

    // Afficher l'astérisque si:
    // 1. Code postal valide (au moins 2 chiffres)
    // 2. DPE est activé
    // 3. Code postal HORS Île-de-France
    if (postalCode.length >= 2 && includeDPE) {
        const departement = postalCode.substring(0, 2);
        const isIDF = IDF_POSTAL_CODES.includes(departement);

        if (!isIDF) {
            // Hors Île-de-France = afficher l'astérisque
            priceAsterisk.style.display = 'inline';
            asteriskNote.style.display = 'block';
        } else {
            // En Île-de-France = pas d'astérisque
            priceAsterisk.style.display = 'none';
            asteriskNote.style.display = 'none';
        }
    } else {
        // Pas de DPE ou code postal invalide = pas d'astérisque
        priceAsterisk.style.display = 'none';
        asteriskNote.style.display = 'none';
    }
}

/**
 * Calcul et affichage du prix
 */
function calculateAndDisplayPrice() {
    const price = calculatePrice(currentLots, includeDPE, currentBuildings);

    // Mise à jour du prix
    const priceText = `${price.toLocaleString('fr-FR')} €`;
    priceDisplay.childNodes[0].textContent = priceText;

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

    // Vérifier l'astérisque
    checkAsteriskDisplay();
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
async function handleQuoteSubmission() {
    const email = emailInput.value.trim();
    const postalCode = postalCodeMain ? postalCodeMain.value.trim() : '';

    // Validation basique
    if (!email) {
        alert('Veuillez remplir votre adresse email');
        return;
    }

    if (!postalCode || postalCode.length !== 5) {
        alert('Veuillez entrer un code postal valide (5 chiffres) en haut du formulaire');
        return;
    }

    // Validation email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert('Veuillez entrer une adresse email valide');
        return;
    }

    // Validation code postal
    if (!/^[0-9]{5}$/.test(postalCode)) {
        alert('Le code postal doit contenir exactement 5 chiffres');
        return;
    }

    const price = calculatePrice(currentLots, includeDPE, currentBuildings);
    const departement = postalCode.substring(0, 2);
    const isIDF = IDF_POSTAL_CODES.includes(departement);

    // Créer le contenu du devis
    const quoteData = {
        email: email,
        postalCode: postalCode,
        lots: currentLots,
        buildings: currentBuildings,
        includeDPE: includeDPE,
        price: price,
        department: departement,
        isIDF: isIDF,
        hasFile: selectedFile !== null,
        fileName: selectedFile ? selectedFile.name : '',
        fileSize: selectedFile ? selectedFile.size : 0,
        fileType: selectedFile ? selectedFile.type : '',
        date: new Date().toISOString(),
        timestamp: Date.now()
    };

    // Log pour debug
    console.log('Devis à envoyer:', quoteData);

    // TODO: Envoyer à votre backend
    // Le backend va:
    // 1. Sauvegarder dans Google Sheets (QUOTES_SHEET_ID)
    // 2. Uploader le fichier PDF si présent
    // 3. Envoyer l'email

    // Pour l'instant, simulation
    try {
        // Ici on appelle le backend quand il sera prêt
        // await fetch('YOUR_BACKEND_URL/api/save-quote', {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify(quoteData)
        // });

        console.log('⚠️ Backend non connecté - Simulation réussie');

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
            resetForm();
        }, 3000);
    } catch (error) {
        console.error('Erreur:', error);
        alert('Une erreur est survenue. Veuillez réessayer.');
    }
}

/**
 * Réinitialiser le formulaire
 */
function resetForm() {
    emailInput.value = '';
    dpeFileInput.value = '';
    selectedFile = null;
    fileName.textContent = 'Choisir un fichier PDF/Image';
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
    checkAsteriskDisplay();
}

// Transition douce pour le prix
if (priceDisplay) {
    priceDisplay.style.transition = 'transform 200ms cubic-bezier(0.4, 0, 0.2, 1)';
}
