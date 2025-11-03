// Simulateur PPPT - Calculateur de Prix
// Version 7.0 - Backend Vercel Serverless (instantané + gratuit + auto-deploy)
// Configuration
const GOOGLE_SHEET_ID = '1nLBmI7uV6v48fq5zqxsYLqSN1EBCsxAfowQI7rxROyQ';
const SHEET_NAME = 'Feuille 1';
const QUOTES_SHEET_ID = '1GiPN9N2rb4vRqdGamQLPNoC0i7wRQaXAon5D9slf4og';
const BACKEND_API_URL = 'https://simulateur-pppt.vercel.app/api/save-quote';

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

// Nouveaux éléments DOM
const propertyAddress = document.getElementById('property-address');
const dpeDate = document.getElementById('dpe-date');
const dpeWarning = document.getElementById('dpe-warning');
const userFirstname = document.getElementById('user-firstname');
const userLastname = document.getElementById('user-lastname');
const userPhone = document.getElementById('user-phone');
const isPresident = document.getElementById('is-president');
const presidentFields = document.getElementById('president-fields');
const presidentFirstname = document.getElementById('president-firstname');
const presidentLastname = document.getElementById('president-lastname');
const presidentEmail = document.getElementById('president-email');
const presidentPhone = document.getElementById('president-phone');
const councilMembersContainer = document.getElementById('council-members-container');
const addMemberBtn = document.getElementById('add-member-btn');
const agDate = document.getElementById('ag-date');
const comment = document.getElementById('comment');
const paymentBtn = document.getElementById('payment-btn');

// Compteur de membres du conseil
let councilMemberCount = 0;

// Date limite DPE
const DPE_CUTOFF_DATE = new Date('2021-07-01');

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

        // Charger le devis depuis l'URL si un quoteId est présent
        await loadQuoteFromUrl();
    } catch (error) {
        console.error('Erreur lors de l\'initialisation:', error);
        // Utiliser des données par défaut en cas d'erreur
        useFallbackData();
    }
}

/**
 * Récupérer un paramètre de l'URL
 */
function getUrlParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

/**
 * Charger un devis depuis l'URL
 */
async function loadQuoteFromUrl() {
    // Vérifier d'abord si on a des données encodées
    const encodedData = getUrlParameter('data');

    if (encodedData) {
        console.log('🔍 Loading quote from encoded data');

        try {
            // Décoder les données base64
            const decoded = atob(encodedData);
            const quotePayload = JSON.parse(decoded);

            console.log('✅ Quote data decoded:', quotePayload.id);

            // Convertir le format court en format complet
            const quoteData = {
                quoteId: quotePayload.id,
                userFirstname: quotePayload.uf || '',
                userLastname: quotePayload.ul || '',
                email: quotePayload.e || '',
                userPhone: quotePayload.p || '',
                postalCode: quotePayload.pc || '',
                propertyAddress: quotePayload.pa || '',
                lots: parseInt(quotePayload.l) || 1,
                buildings: parseInt(quotePayload.b) || 1,
                includeDPE: quotePayload.d === '1',
                dpeDate: quotePayload.dd || '',
                price: quotePayload.pr || '',
                isPresident: quotePayload.ip === '1',
                presidentFirstname: quotePayload.pf || '',
                presidentLastname: quotePayload.pl || '',
                presidentEmail: quotePayload.pe || '',
                presidentPhone: quotePayload.pp || '',
                councilMembers: quotePayload.cm ? JSON.parse(quotePayload.cm) : [],
                agDate: quotePayload.ag || '',
                comment: quotePayload.c || ''
            };

            // Pré-remplir le formulaire
            populateFormWithQuote(quoteData);

            // Afficher le formulaire email automatiquement
            emailForm.style.display = 'block';
            emailQuoteBtn.style.display = 'none';

            return;

        } catch (error) {
            console.error('❌ Error decoding quote data:', error);
            alert('Erreur lors du chargement du devis.');
            return;
        }
    }

    // Ancienne méthode avec API (fallback)
    const quoteId = getUrlParameter('quoteId');

    if (!quoteId) {
        return; // Pas de quoteId, rien à faire
    }

    console.log('🔍 Loading quote via API:', quoteId);

    try {
        const response = await fetch(`${BACKEND_API_URL.replace('/save-quote', '/get-quote')}?id=${encodeURIComponent(quoteId)}`);

        if (!response.ok) {
            console.error('❌ Failed to load quote:', response.statusText);
            alert('Impossible de charger le devis. Veuillez vérifier la référence.');
            return;
        }

        const data = await response.json();

        if (!data.success || !data.quote) {
            console.error('❌ Quote not found');
            alert('Devis non trouvé.');
            return;
        }

        console.log('✅ Quote loaded:', data.quote);

        // Pré-remplir le formulaire
        populateFormWithQuote(data.quote);

        // Afficher le formulaire email automatiquement
        emailForm.style.display = 'block';
        emailQuoteBtn.style.display = 'none';

    } catch (error) {
        console.error('❌ Error loading quote:', error);
        alert('Erreur lors du chargement du devis.');
    }
}

/**
 * Pré-remplir le formulaire avec les données du devis
 */
function populateFormWithQuote(quote) {
    // Code postal et adresse
    if (postalCodeMain && quote.postalCode) {
        postalCodeMain.value = quote.postalCode;
    }

    if (propertyAddress && quote.propertyAddress) {
        propertyAddress.value = quote.propertyAddress;
    }

    // Nombre d'immeubles
    if (quote.buildings) {
        currentBuildings = quote.buildings;
        buildingBtns.forEach(btn => {
            btn.classList.remove('active');
            if (parseInt(btn.dataset.buildings) === quote.buildings) {
                btn.classList.add('active');
            }
        });
    }

    // Nombre de lots
    if (quote.lots) {
        currentLots = quote.lots;
        lotsSlider.value = Math.min(quote.lots, 150);
        lotsInput.value = quote.lots;
        updateSliderProgress();
    }

    // Date DPE
    if (dpeDate && quote.dpeDate) {
        // Convertir le format de date si nécessaire
        try {
            const dateParts = quote.dpeDate.split('/');
            if (dateParts.length === 3) {
                // Format DD/MM/YYYY -> YYYY-MM-DD
                dpeDate.value = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
            } else {
                dpeDate.value = quote.dpeDate;
            }
        } catch (e) {
            console.error('Error parsing date:', e);
        }
    }

    // DPE Collectif
    includeDPE = quote.includeDPE;
    const dpeBtns = document.querySelectorAll('[data-dpe]');
    dpeBtns.forEach(btn => {
        btn.classList.remove('active');
        const btnValue = btn.dataset.dpe === 'true';
        if (btnValue === quote.includeDPE) {
            btn.classList.add('active');
        }
    });

    // Informations utilisateur
    if (userFirstname && quote.userFirstname) {
        userFirstname.value = quote.userFirstname;
    }

    if (userLastname && quote.userLastname) {
        userLastname.value = quote.userLastname;
    }

    if (emailInput && quote.email) {
        emailInput.value = quote.email;
    }

    if (userPhone && quote.userPhone) {
        userPhone.value = quote.userPhone;
    }

    // Président
    if (quote.isPresident && isPresident) {
        isPresident.checked = true;
        presidentFields.style.display = 'none';
    } else {
        if (presidentFirstname && quote.presidentFirstname) {
            presidentFirstname.value = quote.presidentFirstname;
        }

        if (presidentLastname && quote.presidentLastname) {
            presidentLastname.value = quote.presidentLastname;
        }

        if (presidentEmail && quote.presidentEmail) {
            presidentEmail.value = quote.presidentEmail;
        }

        if (presidentPhone && quote.presidentPhone) {
            presidentPhone.value = quote.presidentPhone;
        }
    }

    // Membres du conseil syndical
    if (quote.councilMembers && quote.councilMembers.length > 0) {
        quote.councilMembers.forEach(member => {
            addCouncilMember();
            const lastMember = councilMembersContainer.lastElementChild;

            if (lastMember) {
                const firstnameInput = lastMember.querySelector('.council-member-firstname');
                const lastnameInput = lastMember.querySelector('.council-member-lastname');
                const emailInputMember = lastMember.querySelector('.council-member-email');
                const phoneInput = lastMember.querySelector('.council-member-phone');

                if (firstnameInput && member.firstname) firstnameInput.value = member.firstname;
                if (lastnameInput && member.lastname) lastnameInput.value = member.lastname;
                if (emailInputMember && member.email) emailInputMember.value = member.email;
                if (phoneInput && member.phone) phoneInput.value = member.phone;
            }
        });
    }

    // Date AG
    if (quote.agDate) {
        const agDateInput = document.getElementById('ag-date');
        if (agDateInput) {
            try {
                const dateParts = quote.agDate.split('/');
                if (dateParts.length === 3) {
                    agDateInput.value = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
                } else {
                    agDateInput.value = quote.agDate;
                }
            } catch (e) {
                console.error('Error parsing AG date:', e);
            }
        }
    }

    // Commentaire
    if (quote.comment) {
        const commentInput = document.getElementById('comment');
        if (commentInput) {
            commentInput.value = quote.comment;
        }
    }

    // Recalculer le prix
    calculateAndDisplayPrice();
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

    // Sélecteurs de bâtiments et DPE (même logique)
    buildingBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Gérer les boutons de bâtiments
            if (btn.dataset.buildings) {
                const group = btn.parentElement;
                group.querySelectorAll('.building-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentBuildings = parseInt(btn.dataset.buildings);
                calculateAndDisplayPrice();
            }
            // Gérer les boutons DPE
            else if (btn.dataset.dpe !== undefined) {
                // Vérifier si le bouton est désactivé
                if (btn.disabled) {
                    return;
                }

                const group = btn.parentElement;
                group.querySelectorAll('.building-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                includeDPE = btn.dataset.dpe === 'true';

                calculateAndDisplayPrice();
                checkAsteriskDisplay();
            }
        });
    });

    // Validation date DPE
    if (dpeDate) {
        dpeDate.addEventListener('change', checkDpeDate);
    }

    // Checkbox "Je suis le président"
    if (isPresident) {
        isPresident.addEventListener('change', (e) => {
            if (e.target.checked) {
                presidentFields.style.display = 'none';
                // Vider les champs président
                presidentFirstname.value = '';
                presidentLastname.value = '';
                presidentEmail.value = '';
                presidentPhone.value = '';
            } else {
                presidentFields.style.display = 'block';
            }
        });
    }

    // Bouton ajouter un membre
    if (addMemberBtn) {
        addMemberBtn.addEventListener('click', addCouncilMember);
    }

    // Bouton paiement
    if (paymentBtn) {
        paymentBtn.addEventListener('click', () => {
            // Rediriger vers page de paiement (placeholder pour l'instant)
            window.location.href = 'payment.html';
        });
    }

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
 * Affiche dès que code postal est HORS IDF (5 chiffres valides)
 */
function checkAsteriskDisplay() {
    if (!postalCodeMain) return;

    const postalCode = postalCodeMain.value.trim();
    const dpeActivated = includeDPE; // Utilise la variable globale includeDPE

    // Afficher l'astérisque si:
    // 1. Code postal valide (5 chiffres)
    // 2. Code postal HORS Île-de-France
    // 3. ET prestation DPE activée
    if (postalCode.length === 5 && /^\d{5}$/.test(postalCode)) {
        const departement = postalCode.substring(0, 2);
        const isIDF = IDF_POSTAL_CODES.includes(departement);

        if (!isIDF && dpeActivated) {
            // Hors IDF + DPE activé = afficher l'astérisque
            priceAsterisk.style.display = 'inline';
            asteriskNote.style.display = 'block';
        } else {
            // IDF ou DPE désactivé = pas d'astérisque
            priceAsterisk.style.display = 'none';
            asteriskNote.style.display = 'none';
        }
    } else {
        // Code postal invalide = pas d'astérisque
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
    const buildingText = currentBuildings === 1 ? '1 bâtiment' : `${currentBuildings}${currentBuildings === 3 ? '+' : ''} bâtiments`;
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
 * Vérifier la date DPE et sélectionner automatiquement le bon choix
 * - Date AVANT 01/07/2021 : Forcer "Avec DPE collectif" (DPE obligatoire)
 * - Date APRÈS 01/07/2021 : Présélectionner "Sans DPE collectif" (prix le plus bas)
 */
function checkDpeDate() {
    const dateValue = dpeDate.value;

    // Récupérer les boutons DPE
    const dpeBtns = document.querySelectorAll('[data-dpe]');
    const btnSansDpe = Array.from(dpeBtns).find(btn => btn.dataset.dpe === 'false');
    const btnAvecDpe = Array.from(dpeBtns).find(btn => btn.dataset.dpe === 'true');

    if (!dateValue) {
        // Pas de date : choix libre, pas de warning
        if (btnSansDpe) {
            btnSansDpe.disabled = false;
            btnSansDpe.style.opacity = '1';
            btnSansDpe.style.cursor = 'pointer';
        }
        if (btnAvecDpe) {
            btnAvecDpe.disabled = false;
            btnAvecDpe.style.opacity = '1';
            btnAvecDpe.style.cursor = 'pointer';
        }
        if (dpeWarning) {
            dpeWarning.style.display = 'none';
        }
        return;
    }

    // Parser la date
    const selectedDate = new Date(dateValue);

    if (selectedDate < DPE_CUTOFF_DATE) {
        // ========== Date AVANT 01/07/2021 : DPE OBLIGATOIRE ==========
        console.log('DPE avant 01/07/2021 : DPE obligatoire');

        // Désactiver le bouton "Sans DPE"
        if (btnSansDpe) {
            btnSansDpe.disabled = true;
            btnSansDpe.style.opacity = '0.5';
            btnSansDpe.style.cursor = 'not-allowed';
            btnSansDpe.classList.remove('active');
        }

        // Activer et forcer "Avec DPE"
        if (btnAvecDpe) {
            btnAvecDpe.disabled = false;
            btnAvecDpe.style.opacity = '1';
            btnAvecDpe.style.cursor = 'pointer';
            btnAvecDpe.classList.add('active');
        }

        // Afficher le warning
        if (dpeWarning) {
            dpeWarning.style.display = 'block';
        }

        // Forcer l'état sur "Avec DPE"
        includeDPE = true;
        calculateAndDisplayPrice();
        checkAsteriskDisplay();

    } else {
        // ========== Date APRÈS 01/07/2021 : Présélectionner "Sans DPE" ==========
        console.log('DPE après 01/07/2021 : présélectionner Sans DPE (prix le plus bas)');

        // Réactiver les deux boutons
        if (btnSansDpe) {
            btnSansDpe.disabled = false;
            btnSansDpe.style.opacity = '1';
            btnSansDpe.style.cursor = 'pointer';
            btnSansDpe.classList.add('active'); // Présélectionner "Sans DPE"
        }
        if (btnAvecDpe) {
            btnAvecDpe.disabled = false;
            btnAvecDpe.style.opacity = '1';
            btnAvecDpe.style.cursor = 'pointer';
            btnAvecDpe.classList.remove('active'); // Désélectionner "Avec DPE"
        }

        // Masquer le warning
        if (dpeWarning) {
            dpeWarning.style.display = 'none';
        }

        // Présélectionner "Sans DPE" pour afficher le prix le plus bas
        includeDPE = false;
        calculateAndDisplayPrice();
        checkAsteriskDisplay();
    }
}

/**
 * Ajouter un membre du conseil syndical
 */
function addCouncilMember() {
    councilMemberCount++;
    const memberId = `member-${councilMemberCount}`;

    const memberHTML = `
        <div class="council-member-item" id="${memberId}">
            <div class="council-member-header">
                <span class="council-member-title">Membre ${councilMemberCount}</span>
                <button type="button" class="btn-remove-member" onclick="removeCouncilMember('${memberId}')">Supprimer</button>
            </div>
            <div class="form-grid-2x2">
                <div class="form-group">
                    <label for="${memberId}-firstname" class="form-label">Prénom</label>
                    <input type="text" id="${memberId}-firstname" class="form-input council-member-firstname">
                </div>
                <div class="form-group">
                    <label for="${memberId}-lastname" class="form-label">Nom</label>
                    <input type="text" id="${memberId}-lastname" class="form-input council-member-lastname">
                </div>
                <div class="form-group">
                    <label for="${memberId}-email" class="form-label">Email</label>
                    <input type="email" id="${memberId}-email" class="form-input council-member-email">
                </div>
                <div class="form-group">
                    <label for="${memberId}-phone" class="form-label">Téléphone</label>
                    <input type="tel" id="${memberId}-phone" class="form-input council-member-phone">
                </div>
            </div>
        </div>
    `;

    councilMembersContainer.insertAdjacentHTML('beforeend', memberHTML);
}

/**
 * Supprimer un membre du conseil syndical
 */
function removeCouncilMember(memberId) {
    const memberElement = document.getElementById(memberId);
    if (memberElement) {
        memberElement.remove();
    }
}

/**
 * Gestion de la soumission du devis
 */
async function handleQuoteSubmission() {
    const email = emailInput.value.trim();
    const postalCode = postalCodeMain ? postalCodeMain.value.trim() : '';
    const userFirstnameVal = userFirstname.value.trim();
    const userLastnameVal = userLastname.value.trim();
    const userPhoneVal = userPhone.value.trim();

    // Validations champs obligatoires
    if (!userFirstnameVal) {
        alert('Veuillez remplir votre Prénom');
        return;
    }

    if (!userLastnameVal) {
        alert('Veuillez remplir votre Nom');
        return;
    }

    if (!email) {
        alert('Veuillez remplir votre email');
        return;
    }

    if (!userPhoneVal) {
        alert('Veuillez remplir votre téléphone');
        return;
    }

    if (!postalCode || postalCode.length !== 5) {
        alert('Veuillez entrer un code postal valide (5 chiffres)');
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

    // Validation président (si non coché, au moins 1 champ doit être rempli)
    const isPres = isPresident.checked;
    const presFirstname = presidentFirstname.value.trim();
    const presLastname = presidentLastname.value.trim();
    const presEmail = presidentEmail.value.trim();
    const presPhone = presidentPhone.value.trim();

    if (!isPres && !presFirstname && !presLastname && !presEmail && !presPhone) {
        alert('Veuillez remplir au moins un champ du président du conseil syndical (Prénom, Nom, Email ou Téléphone), ou cochez "Je suis le président"');
        return;
    }

    // Collecter les membres du conseil syndical
    const councilMembers = [];
    const memberItems = document.querySelectorAll('.council-member-item');
    memberItems.forEach(item => {
        const memberFirstname = item.querySelector('.council-member-firstname').value.trim();
        const memberLastname = item.querySelector('.council-member-lastname').value.trim();
        const memberEmail = item.querySelector('.council-member-email').value.trim();
        const memberPhone = item.querySelector('.council-member-phone').value.trim();

        if (memberFirstname || memberLastname || memberEmail || memberPhone) {
            councilMembers.push({
                firstname: memberFirstname,
                lastname: memberLastname,
                email: memberEmail,
                phone: memberPhone
            });
        }
    });

    const price = calculatePrice(currentLots, includeDPE, currentBuildings);
    const departement = postalCode.substring(0, 2);
    const isIDF = IDF_POSTAL_CODES.includes(departement);

    // Créer le contenu du devis
    const quoteData = {
        // Infos utilisateur
        userFirstname: userFirstnameVal,
        userLastname: userLastnameVal,
        email: email,
        userPhone: userPhoneVal,

        // Infos copropriété
        propertyAddress: propertyAddress.value.trim(),
        postalCode: postalCode,
        department: departement,
        isIDF: isIDF,

        // Détails devis
        lots: currentLots,
        buildings: currentBuildings,
        includeDPE: includeDPE,
        dpeDate: includeDPE ? dpeDate.value : '',
        price: price,

        // Président
        isPresident: isPres,
        presidentFirstname: isPres ? userFirstnameVal : presFirstname,
        presidentLastname: isPres ? userLastnameVal : presLastname,
        presidentEmail: isPres ? email : presEmail,
        presidentPhone: isPres ? userPhoneVal : presPhone,

        // Membres conseil
        councilMembers: councilMembers,

        // Infos complémentaires
        agDate: agDate.value,
        comment: comment.value.trim(),

        // Fichier
        hasFile: selectedFile !== null,
        fileName: selectedFile ? selectedFile.name : '',
        fileSize: selectedFile ? selectedFile.size : 0,
        fileType: selectedFile ? selectedFile.type : '',

        // Métadonnées
        date: new Date().toISOString(),
        timestamp: Date.now()
    };

    // Log pour debug
    console.log('Devis à envoyer:', quoteData);

    // Envoyer au backend Vercel
    try {
        // Désactiver le bouton pendant l'envoi
        submitQuoteBtn.disabled = true;
        submitQuoteBtn.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="spinning">
                <circle cx="12" cy="12" r="10"></circle>
            </svg>
            Génération du devis et envoi en cours...
        `;

        // Démarrer la barre de progression
        startProgressBar();

        // Préparer les données JSON
        const payload = {
            // Infos utilisateur
            userFirstname: quoteData.userFirstname,
            userLastname: quoteData.userLastname,
            email: quoteData.email,
            userPhone: quoteData.userPhone,

            // Infos copropriété
            propertyAddress: quoteData.propertyAddress,
            postalCode: quoteData.postalCode,
            department: quoteData.department,
            isIDF: quoteData.isIDF.toString(),

            // Détails devis
            lots: quoteData.lots.toString(),
            buildings: quoteData.buildings.toString(),
            includeDPE: quoteData.includeDPE.toString(),
            dpeDate: quoteData.dpeDate,
            price: quoteData.price.toString(),

            // Président
            isPresident: quoteData.isPresident.toString(),
            presidentFirstname: quoteData.presidentFirstname,
            presidentLastname: quoteData.presidentLastname,
            presidentEmail: quoteData.presidentEmail,
            presidentPhone: quoteData.presidentPhone,

            // Membres conseil (JSON stringifié)
            councilMembers: JSON.stringify(quoteData.councilMembers),

            // Infos complémentaires
            agDate: quoteData.agDate,
            comment: quoteData.comment
        };

        console.log('Sending to Vercel:', payload);

        // Appel au backend Vercel (instantané, pas de cold start)
        const response = await fetch(BACKEND_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (result.success) {
            console.log('✅ Devis sauvegardé:', result.quoteId);

            // Finaliser la barre de progression (compléter jusqu'à 100% en 2 secondes)
            finishProgressBar();

            // Afficher un message de confirmation après que la barre soit complète
            setTimeout(() => {
                submitQuoteBtn.innerHTML = `
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    Devis envoyé avec succès !
                `;
                submitQuoteBtn.style.background = 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)';

                // Cacher la barre de progression une fois l'email envoyé
                hideProgressBar();
            }, 2100); // Légèrement après la finalisation de 2 secondes

            // Réinitialiser le formulaire après 30 secondes
            setTimeout(() => {
                resetForm();
            }, 30000);
        } else {
            throw new Error(result.error || 'Erreur lors de la sauvegarde');
        }
    } catch (error) {
        console.error('❌ Erreur:', error);

        // Arrêter et cacher la barre de progression
        stopProgressBar();
        hideProgressBar();

        // Réactiver le bouton
        submitQuoteBtn.disabled = false;
        submitQuoteBtn.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            Recevoir le devis par email
        `;

        alert('Une erreur est survenue lors de l\'envoi du devis. Veuillez réessayer.');
    }
}

// ==================== GESTION BARRE DE PROGRESSION ====================

let progressInterval = null;
let currentProgress = 0;

/**
 * Démarrer la barre de progression avec ralentissement progressif
 * - 0% à 65% : 225ms par % (rapide) +50%
 * - 65% à 95% : 375ms par % (plus lent, 30% en 11,25 secondes) +50%
 */
function startProgressBar() {
    const progressContainer = document.getElementById('quote-progress-container');
    const progressBar = document.getElementById('quote-progress-bar');
    const progressPercentage = document.getElementById('quote-progress-percentage');

    // Afficher la barre
    progressContainer.style.display = 'block';

    // Réinitialiser
    currentProgress = 0;
    progressBar.style.width = '0%';
    progressPercentage.textContent = '0%';

    function updateProgress() {
        if (currentProgress < 95) {
            currentProgress += 1;
            progressBar.style.width = currentProgress + '%';
            progressPercentage.textContent = currentProgress + '%';

            // Déterminer la vitesse en fonction du pourcentage (+50%)
            const delay = currentProgress < 65 ? 225 : 375;
            progressInterval = setTimeout(updateProgress, delay);
        } else {
            // Arrêter à 95% et attendre la vraie réponse
            progressInterval = null;
        }
    }

    // Démarrer la progression
    updateProgress();
}

/**
 * Finaliser la barre de progression (compléter jusqu'à 100% en 3 secondes) +50%
 */
function finishProgressBar() {
    if (progressInterval) {
        clearTimeout(progressInterval);
    }

    const progressBar = document.getElementById('quote-progress-bar');
    const progressPercentage = document.getElementById('quote-progress-percentage');

    // Calculer le pourcentage restant
    const remaining = 100 - currentProgress;
    const stepTime = 3000 / remaining; // 3 secondes réparties sur les % restants (+50%)

    progressInterval = setInterval(() => {
        if (currentProgress < 100) {
            currentProgress += 1;
            progressBar.style.width = currentProgress + '%';
            progressPercentage.textContent = currentProgress + '%';
        } else {
            clearInterval(progressInterval);
        }
    }, stepTime);
}

/**
 * Arrêter la barre de progression
 */
function stopProgressBar() {
    if (progressInterval) {
        clearTimeout(progressInterval); // Pour startProgressBar qui utilise setTimeout
        clearInterval(progressInterval); // Pour finishProgressBar qui utilise setInterval
        progressInterval = null;
    }
}

/**
 * Cacher la barre de progression
 */
function hideProgressBar() {
    const progressContainer = document.getElementById('quote-progress-container');
    progressContainer.style.display = 'none';
    currentProgress = 0;
}

/**
 * Réinitialiser le formulaire
 * Note: Le formulaire reste visible pour permettre un nouvel envoi
 */
function resetForm() {
    emailInput.value = '';
    dpeFileInput.value = '';
    selectedFile = null;
    fileName.textContent = 'Choisir un fichier PDF/Image';
    // emailForm.style.display = 'none'; // SUPPRIMÉ : on garde le formulaire visible
    submitQuoteBtn.disabled = false;
    // Le bouton emailQuoteBtn n'est pas réinitialisé, le formulaire reste ouvert
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

// ==================== PLUS BESOIN DE KEEPALIVE ====================
// Google Apps Script est toujours actif, pas de cold start ! ⚡
