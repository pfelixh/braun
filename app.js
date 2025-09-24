// ABOUTME: Main application logic for German inheritance tax calculator
// ABOUTME: Implements wizard navigation, form validation, and tax calculations

(function() {
    'use strict';

    // State management
    const state = {
        currentStep: 1,
        formData: {
            relationship: '',
            childAge: null,
            state: '',
            assets: {
                privateAssets: 0,
                businessAssets: 0,
                realEstate: 0,
                familyHome: 0,
                lifeInsurance: 0,
                securities: 0,
                household: 0,
                agriculture: 0
            },
            deductions: {
                debts: 0,
                funeralCosts: 0,
                estateCosts: 0,
                notaryCosts: 0,
                gifts: []
            },
            exemptions: {
                pflegeleistung: false,
                disability: false,
                minorChild: false,
                familyHomeSelfUse: false,
                businessContinuation: false
            }
        }
    };

    // DOM elements
    const elements = {
        steps: document.querySelectorAll('.form-step'),
        progressFill: document.querySelector('.progress-fill'),
        progressSteps: document.querySelectorAll('.step'),
        form: document.getElementById('taxCalculatorForm'),
        
        // Navigation buttons
        step1Next: document.getElementById('step1Next'),
        step2Prev: document.getElementById('step2Prev'),
        step2Next: document.getElementById('step2Next'),
        step3Prev: document.getElementById('step3Prev'),
        step3Next: document.getElementById('step3Next'),
        step4Prev: document.getElementById('step4Prev'),
        calculateBtn: document.getElementById('calculateBtn'),
        
        // Form fields
        relationship: document.getElementById('relationship'),
        childAge: document.getElementById('childAge'),
        childAgeGroup: document.getElementById('childAgeGroup'),
        
        // Asset fields
        privateAssets: document.getElementById('privateAssets'),
        businessAssets: document.getElementById('businessAssets'),
        realEstate: document.getElementById('realEstate'),
        familyHome: document.getElementById('familyHome'),
        lifeInsurance: document.getElementById('lifeInsurance'),
        securities: document.getElementById('securities'),
        household: document.getElementById('household'),
        agriculture: document.getElementById('agriculture'),
        totalAssets: document.getElementById('totalAssets'),
        
        // Deduction fields
        debts: document.getElementById('debts'),
        funeralCosts: document.getElementById('funeralCosts'),
        estateCosts: document.getElementById('estateCosts'),
        notaryCosts: document.getElementById('notaryCosts'),
        giftAmount: document.getElementById('giftAmount'),
        giftYear: document.getElementById('giftYear'),
        giftContainer: document.getElementById('giftContainer'),
        
        // Exemption checkboxes
        pflegeleistung: document.getElementById('pflegeleistung'),
        disability: document.getElementById('disability'),
        minorChild: document.getElementById('minorChild'),
        familyHomeSelfUse: document.getElementById('familyHomeSelfUse'),
        businessContinuation: document.getElementById('businessContinuation'),
        
        // Result elements
        resultTotalAssets: document.getElementById('resultTotalAssets'),
        resultTax: document.getElementById('resultTax'),
        resultNet: document.getElementById('resultNet'),
        allowancesTable: document.getElementById('allowancesTable'),
        exemptionsTable: document.getElementById('exemptionsTable'),
        taxableAmount: document.getElementById('taxableAmount'),
        taxRate: document.getElementById('taxRate'),
        taxClass: document.getElementById('taxClass'),
        appliedExemptions: document.getElementById('appliedExemptions'),
        importantNotes: document.getElementById('importantNotes')
    };

    // Utility functions
    function formatCurrency(amount) {
        return new Intl.NumberFormat('de-DE', {
            style: 'currency',
            currency: 'EUR',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    }

    function parseCurrency(value) {
        if (!value) return 0;
        // Remove all non-numeric characters except comma and dot
        let cleaned = value.replace(/[^\d,.-]/g, '');
        // Replace German decimal comma with dot
        cleaned = cleaned.replace(',', '.');
        // Remove thousand separators (dots that aren't the last one)
        cleaned = cleaned.replace(/\.(?=.*\.)/g, '');
        const parsed = parseFloat(cleaned) || 0;
        return Math.max(0, parsed);
    }

    function showError(fieldId, message) {
        const field = document.getElementById(fieldId);
        const errorElement = document.getElementById(fieldId + '-error');
        if (field) field.classList.add('error');
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.classList.add('show');
        }
    }

    function clearError(fieldId) {
        const field = document.getElementById(fieldId);
        const errorElement = document.getElementById(fieldId + '-error');
        if (field) field.classList.remove('error');
        if (errorElement) {
            errorElement.textContent = '';
            errorElement.classList.remove('show');
        }
    }

    function logAnalytics(eventName, data = {}) {
        if (TAX_CONFIG.ANALYTICS_ENABLED) {
            console.log(`Analytics Event: ${eventName}`, data);
        }
    }

    // Navigation functions
    function showStep(stepNumber) {
        elements.steps.forEach(step => step.classList.remove('active'));
        document.getElementById(`step${stepNumber}`).classList.add('active');
        
        // Update progress
        const progress = (stepNumber / 5) * 100;
        elements.progressFill.style.width = `${progress}%`;
        
        // Update progress steps
        elements.progressSteps.forEach((step, index) => {
            if (index < stepNumber - 1) {
                step.classList.add('completed');
            } else if (index === stepNumber - 1) {
                step.classList.add('active');
            } else {
                step.classList.remove('active', 'completed');
            }
        });
        
        state.currentStep = stepNumber;
        logAnalytics('lead_calc_view', { step: stepNumber });
    }

    function validateStep1() {
        let isValid = true;
        
        // Validate relationship
        if (!elements.relationship.value) {
            showError('relationship', 'Bitte wählen Sie ein Verwandtschaftsverhältnis');
            isValid = false;
        } else {
            clearError('relationship');
        }
        
        // Validate child age if applicable
        if (elements.relationship.value === 'kind' && elements.childAgeGroup.style.display !== 'none') {
            const age = parseInt(elements.childAge.value);
            if (isNaN(age) || age < 0 || age > 27) {
                showError('childAge', 'Bitte geben Sie ein gültiges Alter zwischen 0 und 27 Jahren ein');
                isValid = false;
            } else {
                clearError('childAge');
            }
        }
        
        return isValid;
    }

    function validateStep2() {
        // All fields are optional, just update totals
        updateTotalAssets();
        return true;
    }

    function validateStep3() {
        // Validate gift entries if filled
        const giftAmount = elements.giftAmount.value;
        const giftYear = elements.giftYear.value;
        
        if (giftAmount && !giftYear) {
            showError('giftYear', 'Bitte geben Sie das Jahr der Schenkung an');
            return false;
        }
        
        if (giftYear && !giftAmount) {
            showError('giftAmount', 'Bitte geben Sie den Betrag der Schenkung an');
            return false;
        }
        
        if (giftYear) {
            const year = parseInt(giftYear);
            const currentYear = new Date().getFullYear();
            if (year < currentYear - 10 || year > currentYear) {
                showError('giftYear', `Bitte geben Sie ein Jahr zwischen ${currentYear - 10} und ${currentYear} ein`);
                return false;
            }
        }
        
        return true;
    }

    function updateTotalAssets() {
        let total = 0;
        Object.keys(state.formData.assets).forEach(key => {
            const field = elements[key];
            if (field) {
                const value = parseCurrency(field.value);
                state.formData.assets[key] = value;
                total += value;
            }
        });
        
        elements.totalAssets.textContent = formatCurrency(total);
        logAnalytics('lead_calc_change', { field: 'assets', total });
    }

    function collectFormData() {
        // Basic data
        state.formData.relationship = elements.relationship.value;
        state.formData.state = elements.state?.value || '';
        
        if (elements.relationship.value === 'kind') {
            state.formData.childAge = parseInt(elements.childAge.value) || 0;
        }
        
        // Assets (already collected in updateTotalAssets)
        updateTotalAssets();
        
        // Deductions
        state.formData.deductions.debts = parseCurrency(elements.debts.value);
        state.formData.deductions.funeralCosts = parseCurrency(elements.funeralCosts.value);
        state.formData.deductions.estateCosts = parseCurrency(elements.estateCosts.value);
        state.formData.deductions.notaryCosts = parseCurrency(elements.notaryCosts.value);
        
        // Collect gifts
        state.formData.deductions.gifts = [];
        const giftAmount = parseCurrency(elements.giftAmount.value);
        const giftYear = parseInt(elements.giftYear.value);
        if (giftAmount > 0 && giftYear) {
            state.formData.deductions.gifts.push({ amount: giftAmount, year: giftYear });
        }
        
        // Exemptions
        state.formData.exemptions.pflegeleistung = elements.pflegeleistung.checked;
        state.formData.exemptions.disability = elements.disability.checked;
        state.formData.exemptions.minorChild = elements.minorChild.checked;
        state.formData.exemptions.familyHomeSelfUse = elements.familyHomeSelfUse.checked;
        state.formData.exemptions.businessContinuation = elements.businessContinuation.checked;
    }

    function calculateTax() {
        const data = state.formData;
        const config = TAX_CONFIG;
        
        // Get tax class
        const taxClass = config.RELATIONSHIP_TO_TAX_CLASS[data.relationship] || 'III';
        
        // Calculate gross assets
        let grossAssets = 0;
        Object.values(data.assets).forEach(value => {
            grossAssets += value;
        });
        
        // Calculate deductions
        let totalDeductions = data.deductions.debts + 
                            data.deductions.funeralCosts + 
                            data.deductions.estateCosts + 
                            data.deductions.notaryCosts;
        
        // Add inheritance cost allowance (15,000€ for inheritances)
        totalDeductions += config.INHERITANCE_COST_ALLOWANCE;
        
        // Calculate net assets
        let netAssets = Math.max(0, grossAssets - totalDeductions);
        
        // Apply exemptions
        let exemptedAmount = 0;
        const appliedExemptions = [];
        
        // Family home exemption
        if (data.exemptions.familyHomeSelfUse && data.assets.familyHome > 0 && 
            (data.relationship === 'ehegatte' || data.relationship === 'kind')) {
            exemptedAmount += data.assets.familyHome;
            appliedExemptions.push(`Familienheim selbst bewohnt: ${formatCurrency(data.assets.familyHome)}`);
        }
        
        // Business assets exemption (85% if continued)
        if (data.exemptions.businessContinuation && data.assets.businessAssets > 0) {
            const businessExemption = data.assets.businessAssets * 0.85;
            exemptedAmount += businessExemption;
            appliedExemptions.push(`Betriebsvermögen-Verschonung (85%): ${formatCurrency(businessExemption)}`);
        }
        
        // Calculate taxable amount after exemptions
        let taxableAmount = Math.max(0, netAssets - exemptedAmount);
        
        // Get personal allowance
        let personalAllowance = config.PERSONAL_ALLOWANCES[data.relationship] || 20000;
        
        // Adjust for gifts in last 10 years
        let totalGifts = 0;
        data.deductions.gifts.forEach(gift => {
            totalGifts += gift.amount;
        });
        personalAllowance = Math.max(0, personalAllowance - totalGifts);
        
        // Get maintenance allowance (only for spouse and children)
        let maintenanceAllowance = 0;
        if (data.relationship === 'ehegatte') {
            maintenanceAllowance = config.MAINTENANCE_ALLOWANCES.ehegatte;
        } else if (data.relationship === 'kind' && data.childAge !== null) {
            // Find applicable maintenance allowance based on age
            const childAllowances = config.MAINTENANCE_ALLOWANCES.kind;
            for (let age in childAllowances) {
                if (data.childAge >= parseInt(age)) {
                    maintenanceAllowance = childAllowances[age];
                }
            }
        }
        
        // Get household allowance
        let householdAllowance = 0;
        if (taxClass === 'I') {
            householdAllowance = Math.min(data.assets.household, config.HOUSEHOLD_ALLOWANCES.I.hausrat);
            // Add other movable property allowance
            const otherMovable = Math.max(0, data.assets.household - householdAllowance);
            householdAllowance += Math.min(otherMovable, config.HOUSEHOLD_ALLOWANCES.I.sonstige);
        } else {
            householdAllowance = Math.min(data.assets.household, config.HOUSEHOLD_ALLOWANCES[taxClass].total);
        }
        
        // Apply Pflegefreibetrag if applicable
        let pflegeFreibetrag = 0;
        if (data.exemptions.pflegeleistung && taxClass === 'I') {
            pflegeFreibetrag = config.EXEMPTIONS.PFLEGE_FREIBETRAG;
            appliedExemptions.push(`Pflegefreibetrag: ${formatCurrency(pflegeFreibetrag)}`);
        }
        
        // Calculate total allowances
        const totalAllowances = personalAllowance + maintenanceAllowance + householdAllowance + pflegeFreibetrag;
        
        // Calculate final taxable amount
        const finalTaxableAmount = Math.max(0, taxableAmount - totalAllowances);
        
        // Calculate tax based on tax rate table
        let tax = 0;
        let appliedRate = 0;
        const taxRates = config.TAX_RATES[taxClass];
        
        for (let bracket of taxRates) {
            if (finalTaxableAmount <= bracket.threshold) {
                appliedRate = bracket.rate;
                break;
            }
        }
        
        tax = finalTaxableAmount * (appliedRate / 100);
        
        // Calculate net inheritance
        const netInheritance = Math.max(0, grossAssets - tax);
        
        return {
            grossAssets,
            totalDeductions,
            netAssets,
            exemptedAmount,
            taxableAmount,
            personalAllowance,
            maintenanceAllowance,
            householdAllowance,
            pflegeFreibetrag,
            totalAllowances,
            finalTaxableAmount,
            taxClass,
            appliedRate,
            tax,
            netInheritance,
            appliedExemptions,
            totalGifts
        };
    }

    function displayResults(results) {
        // Main results
        elements.resultTotalAssets.textContent = formatCurrency(results.grossAssets);
        elements.resultTax.textContent = formatCurrency(results.tax);
        elements.resultNet.textContent = formatCurrency(results.netInheritance);
        
        // Allowances table
        let allowancesHTML = '';
        allowancesHTML += `<tr><td>Grundfreibetrag:</td><td>${formatCurrency(results.personalAllowance)}</td></tr>`;
        if (results.maintenanceAllowance > 0) {
            allowancesHTML += `<tr><td>Versorgungsfreibetrag:</td><td>${formatCurrency(results.maintenanceAllowance)}</td></tr>`;
        }
        if (results.householdAllowance > 0) {
            allowancesHTML += `<tr><td>Hausratsfreibetrag:</td><td>${formatCurrency(results.householdAllowance)}</td></tr>`;
        }
        if (results.pflegeFreibetrag > 0) {
            allowancesHTML += `<tr><td>Pflegefreibetrag:</td><td>${formatCurrency(results.pflegeFreibetrag)}</td></tr>`;
        }
        allowancesHTML += `<tr><td>Abzugsfähige Kosten:</td><td>${formatCurrency(results.totalDeductions)}</td></tr>`;
        elements.allowancesTable.innerHTML = allowancesHTML;
        
        // Exemptions table
        let exemptionsHTML = '';
        if (results.totalGifts > 0) {
            exemptionsHTML += `<tr><td>Anrechnung Schenkungen:</td><td class="text-red">+${formatCurrency(results.totalGifts)}</td></tr>`;
        }
        elements.exemptionsTable.innerHTML = exemptionsHTML;
        
        // Tax details
        elements.taxableAmount.textContent = formatCurrency(results.finalTaxableAmount);
        elements.taxRate.textContent = `${results.appliedRate}%`;
        elements.taxClass.textContent = `Steuerklasse ${results.taxClass}`;
        
        // Applied exemptions
        let exemptionsListHTML = '';
        if (results.appliedExemptions.length > 0) {
            results.appliedExemptions.forEach(exemption => {
                exemptionsListHTML += `<li>${exemption}</li>`;
            });
        } else {
            exemptionsListHTML = '<li>Keine besonderen Befreiungen angewendet</li>';
        }
        elements.appliedExemptions.innerHTML = exemptionsListHTML;
        
        // Important notes
        let notes = [];
        if (results.totalGifts > 0) {
            notes.push(`Schenkungen der letzten 10 Jahre werden angerechnet: ${formatCurrency(results.totalGifts)}`);
        }
        if (state.formData.exemptions.familyHomeSelfUse) {
            notes.push('Die Befreiung für das Familienheim gilt nur bei 10-jähriger Selbstnutzung');
        }
        if (state.formData.exemptions.businessContinuation) {
            notes.push('Die Betriebsvermögen-Verschonung unterliegt strengen Voraussetzungen');
        }
        
        if (notes.length > 0) {
            elements.importantNotes.innerHTML = notes.join('<br>');
            elements.importantNotes.parentElement.style.display = 'block';
        } else {
            elements.importantNotes.parentElement.style.display = 'none';
        }
        
        logAnalytics('lead_calc_result', {
            relationship: state.formData.relationship,
            grossAssets: results.grossAssets,
            tax: results.tax,
            netInheritance: results.netInheritance
        });
    }

    // Event handlers
    function initializeEventHandlers() {
        // Navigation buttons
        elements.step1Next.addEventListener('click', () => {
            if (validateStep1()) {
                collectFormData();
                showStep(2);
            }
        });
        
        elements.step2Prev.addEventListener('click', () => showStep(1));
        elements.step2Next.addEventListener('click', () => {
            if (validateStep2()) {
                collectFormData();
                showStep(3);
            }
        });
        
        elements.step3Prev.addEventListener('click', () => showStep(2));
        elements.step3Next.addEventListener('click', () => {
            if (validateStep3()) {
                collectFormData();
                showStep(4);
            }
        });
        
        elements.step4Prev.addEventListener('click', () => showStep(3));
        elements.calculateBtn.addEventListener('click', () => {
            collectFormData();
            const results = calculateTax();
            displayResults(results);
            showStep(5);
        });
        
        // Relationship change handler
        elements.relationship.addEventListener('change', (e) => {
            if (e.target.value === 'kind') {
                elements.childAgeGroup.style.display = 'block';
                elements.childAge.setAttribute('required', 'required');
            } else {
                elements.childAgeGroup.style.display = 'none';
                elements.childAge.removeAttribute('required');
                elements.childAge.value = '';
                clearError('childAge');
            }
            clearError('relationship');
        });
        
        // Currency input handlers
        document.querySelectorAll('.currency-input').forEach(input => {
            input.addEventListener('blur', (e) => {
                const value = parseCurrency(e.target.value);
                e.target.value = value > 0 ? formatCurrency(value).replace('€', '').trim() : '';
                if (state.currentStep === 2) {
                    updateTotalAssets();
                }
            });
            
            input.addEventListener('focus', (e) => {
                const value = parseCurrency(e.target.value);
                e.target.value = value > 0 ? value.toString() : '';
            });
        });
        
        // CTA button
        document.getElementById('ctaButton')?.addEventListener('click', () => {
            logAnalytics('lead_submit_success', {
                relationship: state.formData.relationship,
                totalAssets: Object.values(state.formData.assets).reduce((a, b) => a + b, 0)
            });
            alert('Diese Funktion würde Sie zur Kontaktaufnahme weiterleiten.');
        });
        
        // Enable Enter key navigation
        elements.form.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
                e.preventDefault();
                
                const currentStepElement = document.querySelector('.form-step.active');
                const nextButton = currentStepElement.querySelector('.btn-primary');
                if (nextButton && !nextButton.disabled) {
                    nextButton.click();
                }
            }
        });
        
        // Update next button state based on validation
        elements.relationship.addEventListener('input', () => {
            elements.step1Next.disabled = !elements.relationship.value;
        });
        
        elements.childAge.addEventListener('input', () => {
            if (elements.relationship.value === 'kind') {
                elements.step1Next.disabled = !validateStep1();
            }
        });
    }

    // Smoke test function
    window.runSmokeTests = function() {
        console.log('Running smoke tests...');
        
        // Test 1: Ehegatte, 1,000,000 €
        state.formData = {
            relationship: 'ehegatte',
            childAge: null,
            assets: { privateAssets: 1000000, businessAssets: 0, realEstate: 0, familyHome: 0, lifeInsurance: 0, securities: 0, household: 0, agriculture: 0 },
            deductions: { debts: 0, funeralCosts: 0, estateCosts: 0, notaryCosts: 0, gifts: [] },
            exemptions: { pflegeleistung: false, disability: false, minorChild: false, familyHomeSelfUse: false, businessContinuation: false }
        };
        let result = calculateTax();
        console.log('Test 1 - Ehegatte 1M€:', {
            expected: '≈ 55,000 €',
            actual: formatCurrency(result.tax),
            passed: Math.abs(result.tax - 55000) < 5000
        });
        
        // Test 2: Kind (12 J.), 500,000 €
        state.formData = {
            relationship: 'kind',
            childAge: 12,
            assets: { privateAssets: 500000, businessAssets: 0, realEstate: 0, familyHome: 0, lifeInsurance: 0, securities: 0, household: 0, agriculture: 0 },
            deductions: { debts: 0, funeralCosts: 0, estateCosts: 0, notaryCosts: 0, gifts: [] },
            exemptions: { pflegeleistung: false, disability: false, minorChild: false, familyHomeSelfUse: false, businessContinuation: false }
        };
        result = calculateTax();
        console.log('Test 2 - Kind 500k€:', {
            expected: '≈ 7,000 €',
            actual: formatCurrency(result.tax),
            passed: Math.abs(result.tax - 7000) < 2000
        });
        
        // Test 3: Nicht verwandt, 100,000 €
        state.formData = {
            relationship: 'nicht_verwandt',
            childAge: null,
            assets: { privateAssets: 100000, businessAssets: 0, realEstate: 0, familyHome: 0, lifeInsurance: 0, securities: 0, household: 0, agriculture: 0 },
            deductions: { debts: 0, funeralCosts: 0, estateCosts: 0, notaryCosts: 0, gifts: [] },
            exemptions: { pflegeleistung: false, disability: false, minorChild: false, familyHomeSelfUse: false, businessContinuation: false }
        };
        result = calculateTax();
        console.log('Test 3 - Nicht verwandt 100k€:', {
            expected: '≈ 24,000 €',
            actual: formatCurrency(result.tax),
            passed: Math.abs(result.tax - 24000) < 3000
        });
    };

    // Initialize
    document.addEventListener('DOMContentLoaded', () => {
        initializeEventHandlers();
        showStep(1);
        
        // Disable next button initially
        elements.step1Next.disabled = true;
        
        console.log('Erbschaftssteuer-Rechner initialized');
        console.log('Run window.runSmokeTests() to verify calculations');
    });
})();
