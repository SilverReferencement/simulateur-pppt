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
const userName = document.getElementById('user-name');
const userPhone = document.getElementById('user-phone');
const isPresident = document.getElementById('is-president');
const presidentFields = document.getElementById('president-fields');
const presidentName = document.getElementById('president-name');
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
                presidentName.value = '';
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
    if (!postalCodeMain || !dpeToggle) return;

    const postalCode = postalCodeMain.value.trim();
    const dpeActivated = dpeToggle.checked;

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
 * Vérifier la date DPE et activer/désactiver les boutons
 */
function checkDpeDate() {
    const dateValue = dpeDate.value;

    // Récupérer les boutons DPE
    const dpeBtns = document.querySelectorAll('[data-dpe]');
    const btnSansDpe = Array.from(dpeBtns).find(btn => btn.dataset.dpe === 'false');
    const btnAvecDpe = Array.from(dpeBtns).find(btn => btn.dataset.dpe === 'true');

    if (!dateValue) {
        // Pas de date : choix libre
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
        // Date avant 01/07/2021 : DPE obligatoire
        console.log('DPE avant 01/07/2021 : DPE obligatoire');

        // Désactiver le bouton "Sans DPE"
        if (btnSansDpe) {
            btnSansDpe.disabled = true;
            btnSansDpe.style.opacity = '0.5';
            btnSansDpe.style.cursor = 'not-allowed';
            btnSansDpe.classList.remove('active');
        }

        // Activer et sélectionner "Avec DPE"
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

        // Mettre à jour l'état
        includeDPE = true;
        calculateAndDisplayPrice();
        checkAsteriskDisplay();

    } else {
        // Date après 01/07/2021 : choix libre
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
            <div class="form-group">
                <label for="${memberId}-name" class="form-label">Prénom Nom</label>
                <input type="text" id="${memberId}-name" class="form-input council-member-name">
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
    const userNameVal = userName.value.trim();
    const userPhoneVal = userPhone.value.trim();

    // Validations champs obligatoires
    if (!userNameVal) {
        alert('Veuillez remplir votre Prénom Nom');
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
    const presName = presidentName.value.trim();
    const presEmail = presidentEmail.value.trim();
    const presPhone = presidentPhone.value.trim();

    if (!isPres && !presName && !presEmail && !presPhone) {
        alert('Veuillez remplir au moins un champ du président du conseil syndical (Nom, Email ou Téléphone), ou cochez "Je suis le président"');
        return;
    }

    // Collecter les membres du conseil syndical
    const councilMembers = [];
    const memberItems = document.querySelectorAll('.council-member-item');
    memberItems.forEach(item => {
        const memberName = item.querySelector('.council-member-name').value.trim();
        const memberEmail = item.querySelector('.council-member-email').value.trim();
        const memberPhone = item.querySelector('.council-member-phone').value.trim();

        if (memberName || memberEmail || memberPhone) {
            councilMembers.push({
                name: memberName,
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
        userName: userNameVal,
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
        presidentName: isPres ? userNameVal : presName,
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

        // Préparer les données JSON
        const payload = {
            // Infos utilisateur
            userName: quoteData.userName,
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
            presidentName: quoteData.presidentName,
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
        } else {
            throw new Error(result.error || 'Erreur lors de la sauvegarde');
        }
    } catch (error) {
        console.error('❌ Erreur:', error);

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

/**
 * Réinitialiser le formulaire
 */
function resetForm() {
    emailInput.value = '';
    dpeFileInput.value = '';
    selectedFile = null;
    fileName.textContent = 'Choisir un fichier PDF/Image';
    emailForm.style.display = 'none';
    submitQuoteBtn.disabled = false;
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

// ==================== PLUS BESOIN DE KEEPALIVE ====================
// Google Apps Script est toujours actif, pas de cold start ! ⚡
