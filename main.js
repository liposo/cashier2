window.addEventListener("load", function () {
    let cards = document.querySelectorAll(".card");
    let cashierFormSection = document.getElementById("cashierPaymentForm");
    let methodContainer = document.getElementById("methodsContainer");
    let form = document.getElementById("cashierForm");

    //Get and update geolocation if available 
    let latitude = document.querySelector(".latitude");
    let longitude = document.querySelector(".longitude");
    updateCoordinates(latitude, longitude);

    for (let i = 0; i < cards.length; i++) {
        cards[i].addEventListener('click', function () {
            let methodData = getMethodData(this);
            
            methodContainer.className = "scrolling-wrapper";
            
            let currentMethod = document.querySelector('[id^="selected-"]');
            if(currentMethod) {
                form.removeChild(currentMethod);  
            }
            
            form.appendChild(buildPaymentFormFields(cards, cashierFormSection, methodData));
            form.classList.add("method-container");

            for (let i = 0; i < cards.length; i++) {
                cards[i].classList.add("card-small");
                cards[i].style.display = 'flex';
            }

            this.style.display = 'none';

        }, false);
    }
});

function buildPaymentFormFields(cards, cashierFormSection, methodData) {
    //<div id="selectedMethod" class="form-wrapper">
    let selectedMethod = document.createElement("div");
    selectedMethod.className = "form-wrapper";
    selectedMethod.id = "selected-" + methodData.id;

    // append logo and amount row
    selectedMethod.appendChild(buildLogoAmountRow(methodData));

    //<div class="payment-data-row">
    let paymentDataRow = document.createElement("div");
    paymentDataRow.className = "payment-data-row";

    //append custom field
    let hasSavedValues = Object.keys(methodData.customFieldValue).length > 0;
    if (hasSavedValues) {
        paymentDataRow.appendChild(buildSelectSavedData(methodData.customFieldValue,
            paymentDataRow,
            methodData));
    } else {
        switch (methodData.customfield) {
            case "fullCard":
                paymentDataRow.appendChild(buildFullCard(methodData));
                break;
            case "cardPan":
            case "phone":
            case "accountId":
                paymentDataRow.appendChild(buildCustomField(methodData));
                break;
            default:
        }
    }

    selectedMethod.appendChild(paymentDataRow);

    // append submit form row
    selectedMethod.appendChild(buildSubmitFormRow(methodData));

    // add hidden inputs
    let iframe = window !== window.parent;
    let domain;

    if (iframe) {
        domain = document.location.ancestorOrigins[0].replace(/^https?\:\/\//i, "");
    }

    selectedMethod.appendChild(buildHiddenInput("paymentMethod", "", methodData.method));
    selectedMethod.appendChild(buildHiddenInput("customPaymentMethod", "", methodData.custompaymentmethod));
    selectedMethod.appendChild(buildHiddenInput("currency", "", methodData.currency));
    selectedMethod.appendChild(buildHiddenInput("_screenHeight", "screenHeight", screen.height));
    selectedMethod.appendChild(buildHiddenInput("_screenWidth", "screenWidth", screen.width));
    selectedMethod.appendChild(buildHiddenInput("_timezone_offset", "timezone_offset", new Date().getTimezoneOffset()));
    selectedMethod.appendChild(buildHiddenInput("_isIframe", "isIframe", iframe.toString()));
    selectedMethod.appendChild(buildHiddenInput("_domain", "domain", domain));
    selectedMethod.appendChild(buildHiddenInput("_isJavaEnabled", "javaEnabled", navigator.javaEnabled()));
    selectedMethod.appendChild(buildHiddenInput("_screenColorDepth", "screenColorDepth", screen.colorDepth));

    cashierFormSection.appendChild(selectedMethod);

    // CleaveJS
    if (document.querySelector(".amount")) {
        new Cleave('.amount', {
            numeral: true,
            numeralDecimalMark: '.',
            delimiter: ' '
        });
    }

    applyCleaveToCardFields();

    return selectedMethod;
};

function applyCleaveToCardFields() {
    let cardPanField = document.querySelector(".cardPan");
    if (cardPanField) {
        new Cleave('.cardPan', {
            creditCard: true,
            creditCardStrictMode: true
        });
        cardPanField.addEventListener("blur", function () {
            isCardValid(cardPanField);
        });
    }

    let cardExpiryDate = document.querySelector(".expiry-date");
    if (cardExpiryDate) {
        new Cleave('.expiry-date', {
            date: true,
            datePattern: ['m', 'y']
        });
    }

    let cardCvv = document.querySelector(".cvv");
    if (cardCvv) {
        new Cleave('.cvv', {
            numeral: true,
            numeralDecimalMark: '',
            delimiter: ''
        });
    }
}

function buildHiddenInput(name, className, value) {
    let hiddenInput = document.createElement("input");
    hiddenInput.type = "hidden";
    hiddenInput.name = name;
    if (className.length > 0) {
        hiddenInput.classList.add(className);
    }
    if (value != undefined) {
        hiddenInput.value = value;
    }

    return hiddenInput;
}

function buildCheckbox(label) {
    //<label class="checkbox-container">
    let checkboxContainer = document.createElement("label");
    checkboxContainer.className = "checkbox-container";
    checkboxContainer.innerHTML = label;

    //<input type="checkbox" id="saveData">
    let checkboxInput = document.createElement("input");
    checkboxInput.type = "checkbox";
    checkboxInput.id = "saveData";
    checkboxInput.name = "saveData";

    //<span class="checkbox-mark">
    let mark = document.createElement("span");
    mark.className = "checkbox-mark";

    checkboxContainer.appendChild(checkboxInput);
    checkboxContainer.appendChild(mark);

    return checkboxContainer;
}

function buildLogoAmountRow(method) {
    //<div class="logo-amount-row">
    let logoAmountRow = document.createElement("div");
    logoAmountRow.className = "logo-amount-row";

    logoAmountRow.appendChild(buildLogo(method));
    logoAmountRow.appendChild(buildAmount(method));

    return logoAmountRow;
}

function buildLogo(method) {
    //<div class="form-logo">
    let divLogo = document.createElement("div");
    divLogo.className = "form-logo";

    //<img src="img/bigwallet.svg">
    let logo = document.createElement("img");
    logo.src = method.logo;

    //<small>10 EUR - EUR</small>
    let amountRangeText = document.createElement("small");
    amountRangeText.innerHTML = method.amountrange;

    divLogo.appendChild(logo);
    divLogo.appendChild(amountRangeText);

    return divLogo;
}

function buildAmount(method) {
    //<div class="amount-container">
    let amountContainerDiv = document.createElement("div");
    amountContainerDiv.className = "amount-container";

    if (method.predefinedamounts) {
        amountContainerDiv.appendChild(buildPredefinedAmounts(method));
        amountContainerDiv.appendChild(buildRadioManualAmount(method));
    } else if (method.amount.length <= 0) {
        amountContainerDiv.appendChild(buildManualAmount(method));
    }

    if (method.error) {
        amountContainerDiv.appendChild(buildErrorDiv(method));
    }

    return amountContainerDiv;
}

function buildPredefinedAmounts(method) {
    //<div class="predefined-amount-row">
    let predefinedAmountRowDiv = document.createElement("div");
    predefinedAmountRowDiv.className = "predefined-amount-row";

    //<span>Amount: </span>
    let amountLabel = document.createElement("label");
    amountLabel.innerHTML = method.labels.amount + ": ";
    predefinedAmountRowDiv.appendChild(amountLabel);

    let predefinedAmounts = method.predefinedamounts.split(":");
    for (let i = 0; i < predefinedAmounts.length; i++) {
        predefinedAmountRowDiv.appendChild(buildPredefinedamountRadio(predefinedAmounts[i]));
    }

    return predefinedAmountRowDiv;
}

function buildPredefinedamountRadio(amount) {
    //<label class="radio-container">
    let customRadio = document.createElement("label");
    customRadio.className = "radio-container";
    customRadio.innerText = amount;

    //<input id="amount100" name="amount" type="radio" value="100" checked="checked">
    let radioInput = document.createElement("input");
    radioInput.id = "amount" + amount;
    radioInput.name = "cashier.amount";
    radioInput.type = "radio";
    radioInput.value = amount;
    radioInput.required = true;

    //<span class="checkmark"></span>
    let radioCheckmark = document.createElement("span");
    radioCheckmark.className = "checkmark";

    customRadio.appendChild(radioInput);
    customRadio.appendChild(radioCheckmark);

    return customRadio;
}

function buildRadioManualAmount(method) {
    //<div class="manual-amount-row">
    let manualAmountRow = document.createElement("div");
    manualAmountRow.className = "manual-amount-row";

    //<label class="radio-container radio-container-manual-amount">
    let customRadioManualAmount = document.createElement("label");
    customRadioManualAmount.className = "radio-container radio-container-manual-amount";

    //<input id="manualAmountRadio" name="amount" type="radio" value="">
    let manualAmountRadio = document.createElement("input");
    manualAmountRadio.id = "manualAmountRadio";
    manualAmountRadio.name = "cashier.amount";
    manualAmountRadio.type = "radio";
    manualAmountRadio.value = method.defaultamount;
    manualAmountRadio.required = true;
    manualAmountRadio.checked = true;

    //<span class="checkmark"></span>
    let manualAmountCheckmark = document.createElement("span");
    manualAmountCheckmark.className = "checkmark";

    customRadioManualAmount.appendChild(manualAmountRadio);
    customRadioManualAmount.appendChild(manualAmountCheckmark);

    manualAmountRow.appendChild(customRadioManualAmount);

    //<div class="manual-amount">
    let manualAmount = document.createElement("div");
    manualAmount.className = "manual-amount";

    //<input class="text-input has-error" name="amount" id="manualAmountInput" type="text" placeholder="Amount" />
    let manualamountInput = document.createElement("input");
    manualamountInput.className = "text-input amount";
    manualamountInput.id = "manualAmountInput";
    manualamountInput.type = "text";
    manualamountInput.value = method.defaultamount;
    manualamountInput.placeholder = method.labels.amount;

    // event listeners to select radio on field focus and assign input value to radio value.
    manualamountInput.addEventListener("click", function () {
        manualAmountRadio.checked = true;
        manualAmountRadio.value = this.value;
        this.required = true;
    });
    manualamountInput.addEventListener("change", function () {
        manualAmountRadio.value = this.value;
    });

    // event listener to removed required from manual input if another option is selected
    manualAmountRadio.addEventListener("change", function () {
        if (!manualAmountRadio.checked) {
            manualamountInput.checked = false;
        }
    });

    //<p class="">Small text under the amount input</p>
    let textUnderAmountInput = document.createElement("p");
    textUnderAmountInput.innerHTML = method.textUnderAmount;

    manualAmount.appendChild(manualamountInput);
    manualAmount.appendChild(textUnderAmountInput);

    manualAmountRow.appendChild(manualAmount);

    return manualAmountRow;
}

function buildErrorDiv(method) {
    //<div class="error">Amount out of range</div>   
    let errorDiv = document.createElement("div");
    errorDiv.className = "error";
    errorDiv.innerHTML = method.error;

    return errorDiv;
}

function buildManualAmount(method) {
    //<div class="amount-container">
    let amountContainerDiv = document.createElement("div");
    amountContainerDiv.className = "amount-container";

    //<div class="manual-amount-row">
    let manualAmountRow = document.createElement("div");
    manualAmountRow.className = "manual-amount-row";

    //<div class="manual-amount">
    let manualamount = document.createElement("div");
    manualamount.className = "manual-amount";

    //<span>Amount: </span>
    let amountLabel = document.createElement("label");
    amountLabel.innerHTML = method.labels.amount;
    amountLabel.className = "input-label";
    amountLabel.htmlFor = "manualAmountInput";

    //<input class="text-input has-error" name="amount" id="manualAmountInput" type="text" placeholder="Amount" />
    let manualamountInput = document.createElement("input");
    manualamountInput.className = "text-input amount";
    manualamountInput.id = "manualAmountInput";
    manualamountInput.name = "cashier.amount"
    manualamountInput.type = "text";
    manualamountInput.value = method.defaultamount;
    manualamountInput.placeholder = method.labels.amount;

    //<p class="">Small text under the amount input</p>
    let textUnderAmountInput = document.createElement("p");
    textUnderAmountInput.innerHTML = method.textUnderAmount
    manualamount.appendChild(amountLabel);
    manualamount.appendChild(manualamountInput);
    manualamount.appendChild(textUnderAmountInput);

    manualAmountRow.appendChild(manualamount);

    return manualAmountRow
}

function buildFullCard(method) {
    //<div class="payment-data-fields-container">
    let paymentFieldsContainer = document.createElement("div");
    paymentFieldsContainer.className = "payment-data-fields-container";

    paymentFieldsContainer.appendChild(buildFullCardInput("input-container",
        "card.number",
        "cardPan",
        method.fullcardlabels.pan != undefined ? method.fullcardlabels.pan : "Card Number",
        method.fullcardplaceholder.pan != undefined ? method.fullcardplaceholder.pan : "Card Number"
    ));

    paymentFieldsContainer.appendChild(buildFullCardInput("input-container",
        "card.holder",
        "holder",
        method.fullcardlabels.holder != undefined ? method.fullcardlabels.holder : "Holder Name",
        method.fullcardplaceholder.holder != undefined ? method.fullcardplaceholder.holder : "Holder Name"
    ));

    //<div class="date-cvv">
    let dateCvvRow = document.createElement("div");
    dateCvvRow.className = "date-cvv";

    dateCvvRow.appendChild(buildFullCardInput("small-input-wapper",
        "card.expiryDate",
        "expiry-date",
        method.fullcardlabels.expiryMonth != undefined ? method.fullcardlabels.expiryMonth : "Expiry Date",
        method.fullcardplaceholder.expiryMonth != undefined ? method.fullcardplaceholder.expiryMonth : "MM/YY"
    ));

    dateCvvRow.appendChild(buildFullCardInput("small-input-wapper",
        "card.cvv",
        "cvv",
        method.fullcardlabels.cvv != undefined ? method.fullcardlabels.cvv : "CVV2/CVC",
        method.fullcardplaceholder.cvv != undefined ? method.fullcardplaceholder.cvv : "CVV2/CVC"
    ));

    paymentFieldsContainer.appendChild(dateCvvRow);

    //Append save data checkbox
    paymentFieldsContainer.appendChild(buildCheckbox(method.labels.save));

    let hasSavedValues = Object.keys(method.customFieldValue).length > 0;
    if (hasSavedValues) {
        paymentFieldsContainer.appendChild(builBackToSavedValues(method));
    }

    return paymentFieldsContainer;
}

function buildSelectSavedData(savedValues, parent, method) {
    //<div class="selectWrapper">
    let selectWrapper = document.createElement("div");
    selectWrapper.className = "select-wrapper";

    //<div class="select mb-8em" tabindex="1">
    let customSelect = document.createElement("div");
    customSelect.className = "select";
    customSelect.tabIndex = 1;
    customSelect.id = "selector";

    let lenght = Object.keys(savedValues).length;
    for (let i = 0; i < lenght; i++) {
        let key = Object.keys(savedValues)[i];
        let value = Object.values(savedValues)[i];

        let selectOption = buildSelectorInput(key, value, i);
        customSelect.appendChild(selectOption);
        customSelect.appendChild(buildSelectLabel(key, value, selectOption, customSelect, method));
    }

    if (method.customfield == "fullCard") {
        customSelect.classList.add("with-cvv");

        let fieldsContainer = document.createElement("div");
        fieldsContainer.className = "select-cvv";

        //Label and custom select
        let customSelectorContainer = document.createElement("div");
        customSelectorContainer.className = "select-cvv-container";

        let label = document.createElement("p");
        label.className = "input-label";
        label.innerHTML = method.labels.select;

        customSelectorContainer.appendChild(label);
        customSelectorContainer.appendChild(customSelect)

        fieldsContainer.appendChild(customSelectorContainer);
        fieldsContainer.appendChild(buildFullCardInput("small-input-wapper wrappable",
            "card.cvv",
            "cvv",
            method.fullcardlabels.cvv != undefined ? method.fullcardlabels.cvv : "CVV2/CVC",
            method.fullcardplaceholder.cvv != undefined ? method.fullcardplaceholder.cvv : "CVV2/CVC"));

        selectWrapper.appendChild(fieldsContainer);
        selectWrapper.appendChild(buildAddNewButton(method));

        return selectWrapper;
    }

    selectWrapper.appendChild(customSelect);
    selectWrapper.appendChild(buildAddNewButton(method));

    return selectWrapper;
}

function buildAddNewButton(method) {
    //<div class="add-new">
    let addNewContainer = document.createElement("div");
    addNewContainer.className = "add-new";

    //<span>+</span>
    let plusSign = document.createElement("span");
    plusSign.innerHTML = "+";

    //<p class="text-new">Use different account number</p>
    let addNewText = document.createElement("p");
    addNewText.innerHTML = method.labels.addNew;
    addNewText.className = "text-new";

    addNewContainer.appendChild(plusSign);
    addNewContainer.appendChild(addNewText);

    addNewContainer.addEventListener('click', function () {
        let paymentDataRow = document.querySelector(".payment-data-row");
        let selectWrapper = document.querySelector(".select-wrapper");


        //Remove custom select container
        paymentDataRow.removeChild(selectWrapper);

        //Add form fields
        switch (method.customfield) {
            case "fullCard":
                paymentDataRow.appendChild(buildFullCard(method));
                break;
            case "cardPan":
            case "phone":
            case "accountId":
                paymentDataRow.appendChild(buildCustomField(method));
                break;
            default:
        }

        applyCleaveToCardFields();
    });

    return addNewContainer;
}

function builBackToSavedValues(method) {
    //<div class="back">
    let backContainer = document.createElement("div");
    backContainer.className = "add-new";

    //<p class="text-new">Back</p>
    let backText = document.createElement("p");
    backText.innerHTML = method.labels.back;
    backText.className = "text-new";

    backContainer.appendChild(backText);

    backContainer.addEventListener('click', function () {
        let paymentDataRow = document.querySelector(".payment-data-row");
        let paymentData = document.querySelector(".payment-data-fields-container");

        //Remove custom select container
        paymentDataRow.removeChild(paymentData);

        paymentDataRow.appendChild(buildSelectSavedData(method.customFieldValue,
            paymentDataRow,
            method));
    });

    return backContainer;
}

function buildSelectorInput(key, value, position) {
    //<input class="options-select option-input" name="selectors" type="radio" id="opt1" checked>
    let input = document.createElement("input");
    input.type = "radio";
    input.id = value;
    input.value = key;
    input.className = "options-select option-input";
    input.name = "savedDataSelected";
    input.required = true;
    if (position == 0) {
        input.checked = true;
    }

    return input;
}

function buildSelectLabel(key, value, input, parent, method) {
    //<label for="opt1" class="option">
    let optionLabel = document.createElement("label");
    optionLabel.className = "option";
    optionLabel.htmlFor = value;

    //<div class="option-content-container">
    let option = document.createElement("div");
    option.className = "option-content-container";

    //<p>value</p>
    let optionText = document.createElement("p");
    if (method.customfield == "phone") {
        let phoneNumber = value.split(":");
        optionText.innerHTML = "(" + phoneNumber[0] + ") " + phoneNumber[1];
    } else {
        optionText.innerHTML = value;
    }

    //<div class="delete-icon">
    let deleteWrapper = document.createElement("div");
    deleteWrapper.className = "delete-icon";

    //<img src="img/delete-icon.svg" />
    let deleteIcon = document.createElement("img");
    deleteIcon.src = "img/delete-icon.svg";

    deleteWrapper.appendChild(deleteIcon);

    option.appendChild(optionText);
    option.appendChild(deleteWrapper);

    //delete event listener
    deleteWrapper.addEventListener("click", function () {
        //TODO fetch delete API

        parent.removeChild(input);
        parent.removeChild(optionLabel);

        //remove value from savedValues
        let selectedMethodSavedValues = method.customFieldValue;
        delete selectedMethodSavedValues[key];

        //re-write data-attribute with removed value
        let selectedMethod = document.getElementById(method.id);
        selectedMethod.setAttribute("data-customfieldvalue", JSON.stringify(selectedMethodSavedValues));

        let inputs = parent.querySelectorAll("input")
        if (inputs.length != 0) {
            inputs[0].checked = true;
        } else {
            let paymentDataRow = document.querySelector(".payment-data-row");

            //Remove custom select container
            paymentDataRow.removeChild(parent.parentElement);

            switch (method.customfield) {
                case "fullCard":
                    paymentDataRow.appendChild(buildFullCard(method));
                    break;
                case "cardPan":
                case "phone":
                case "accountId":
                    paymentDataRow.appendChild(buildCustomField(method));
                    break;
                default:
            }
        }
    });

    optionLabel.appendChild(option);

    return optionLabel;
}

function buildFullCardInput(containerClass, inputName, inputClass, label, placeholder) {
    //<div class="input-container">
    let inputContainer = document.createElement("div");
    inputContainer.className = containerClass;

    //<label for="card.number" class="input-label">Card number</label>
    let inputLabel = document.createElement("label");
    inputLabel.htmlFor = inputName;
    inputLabel.className = "input-label";
    inputLabel.innerHTML = label;

    //<input id="card.number" name="card.number" class="text-input has-error" type="text" placeholder="Card Number" />
    let input = document.createElement("input");
    input.type = "text";
    input.id = inputName;
    input.name = inputName;
    input.className = "text-input " + inputClass;
    input.placeholder = placeholder;
    input.required = true;
    input.autocomplete = "none";

    if (inputName == "card.cvv") {
        input.type = "password";
        input.pattern = "[0-9]{3,4}";
        input.maxLength = "4";
        input.minLength = "3";
    }

    inputContainer.appendChild(inputLabel);
    inputContainer.appendChild(input);

    return inputContainer
}

function buildCustomField(method) {
    //<div class="payment-data-fields-container">
    let paymentFieldsContainer = document.createElement("div");
    paymentFieldsContainer.className = "payment-data-fields-container";

    //<div class="input-container">
    let inputContainer = document.createElement("div");
    inputContainer.className = "input-container";

    if (method.customfield == "phone") {
        //<label for="cashier.customInput" class="input-label">Phone Number</label>
        let inputLabel = document.createElement("label");
        inputLabel.htmlFor = "cahier." + method.customfield;
        inputLabel.className = "input-label"
        inputLabel.innerHTML = method.customfieldlabel;

        //<div class="phone-wrapper">
        let phoneWrapper = document.createElement("div");
        phoneWrapper.className = "phone-wrapper";

        //<input id="cashier.phoneCountryCode" name="cashier.phoneCountryCode" class="text-input phone-code" type="tel" />
        let countryCodeInput = document.createElement("input");
        countryCodeInput.type = ("tel");
        countryCodeInput.id = "cahier.phoneCountryCode";
        countryCodeInput.name = "cahier.phoneCountryCode";
        countryCodeInput.className = "text-input phone-code"
        countryCodeInput.placeholder = method.labels.countryCode != undefined ? method.labels.countryCode : "Code";
        countryCodeInput.required = true;
        countryCodeInput.maxLength = 5;

        //<input id="cashier.phone" name="cashier.number" class="text-input phone" type="tel" placeholder="" />
        let phoneInput = document.createElement("input");
        phoneInput.type = ("tel");
        phoneInput.id = "cahier." + method.customfield;
        phoneInput.name = "cahier." + method.customfield;
        phoneInput.className = "text-input " + method.customfield;
        phoneInput.placeholder = method.customfieldplaceholder;
        phoneInput.required = true;


        phoneWrapper.appendChild(countryCodeInput);
        phoneWrapper.appendChild(phoneInput);

        inputContainer.appendChild(inputLabel);
        inputContainer.appendChild(phoneWrapper);
    } else {
        //<label for="cashier.customInput" class="input-label">Account Id</label>
        let inputLabel = document.createElement("label");
        inputLabel.htmlFor = "cahier." + method.customfield;
        inputLabel.className = "input-label"
        inputLabel.innerHTML = method.customfieldlabel;

        //<input id="cashier.customInput" name="cashier.customInput" class="text-input has-error" type="text" placeholder="" />
        let input = document.createElement("input");
        input.type = ("text");
        input.id = "cahier." + method.customfield;
        input.name = "cahier." + method.customfield;
        input.className = "text-input " + method.customfield;
        input.placeholder = method.customfieldplaceholder;
        input.pattern = method.customfieldregex;
        input.required = true;
        input.title = method.customFieldValidationMsg;

        inputContainer.appendChild(inputLabel);
        inputContainer.appendChild(input);
    }

    paymentFieldsContainer.appendChild(inputContainer);

    let hasSavedValues = Object.keys(method.customFieldValue).length > 0;
    if (hasSavedValues) {
        paymentFieldsContainer.appendChild(builBackToSavedValues(method));
    }

    return paymentFieldsContainer;
}

function buildSubmitFormRow(method) {
    //<div class="submit-row">
    let submitRow = document.createElement("div");
    submitRow.className = "submit-row";

    //<div class="submit-container">
    let submitContainer = document.createElement("div");
    submitContainer.className = "submit-container";

    //<button class="submit-button mb-8em">Submit</button>
    let button = document.createElement("button");
    button.id = "cashierFormSubmit"
    button.className = "submit-button mb-8em";
    button.innerText = method.labels.submit;
    submitContainer.appendChild(button);

    //<a class="cancel-link mb-8em" href="#">Cancel</a>
    // let cancelLink = document.createElement("a");
    // cancelLink.classList = "cancel-link mb-8em"
    // cancelLink.innerText = method.labels.cancel;
    // cancelLink.href = method.cancel;
    // submitContainer.appendChild(cancelLink);

    if (method.customfield === "fullCard") {
        //<div class="cards-brands mb-8em">
        let cardLogos = document.createElement("div");
        cardLogos.className = "cards-brands mb-8em";

        //<img src="img/cc-images.svg" />
        let cardLogosImg = document.createElement("img");
        cardLogosImg.src = "img/cc-images.svg";
        cardLogos.appendChild(cardLogosImg);
        submitContainer.appendChild(cardLogos);

        //<div class="pci-logo-wrapper mb-8em">
        let pciLogo = document.createElement("div");
        pciLogo.className = "pci-logo-wrapper mb-8em";

        //<img class="pci-logo" src="img/pci-dss-logo.svg" />
        let pciLogoImg = document.createElement("img");
        pciLogoImg.className = "pci-logo";
        pciLogoImg.src = "img/pci-dss-logo.svg";
        pciLogo.appendChild(pciLogoImg);

        submitContainer.appendChild(pciLogo);
    }
    submitRow.appendChild(submitContainer);

    //Do before submit form
    button.onsubmit = function () {
        button.disabled = true;
        return true;
    }

    return submitRow;
}

function getMethodData(method) {
    return mathodData = {
        id: method.id,
        method: method.getAttribute('data-method'),
        selected: method.getAttribute('data-selected'),
        amount: method.getAttribute('data-amount'),
        predefinedamounts: method.getAttribute('data-predefinedamounts'),
        defaultamount: method.getAttribute('data-defaultamount'),
        currency: method.getAttribute('data-currency'),
        custompaymentmethod: method.getAttribute('data-custompaymentmethod'),
        error: method.getAttribute('data-error'),
        customfield: method.getAttribute('data-customfield'),
        logo: method.getAttribute('data-logo'),
        customFieldValue: JSON.parse(method.getAttribute('data-customfieldvalue')),
        amountrange: method.getAttribute('data-amountrange'),
        amountlabel: method.getAttribute('data-amountlabel'),
        fullcardplaceholder: JSON.parse(method.getAttribute('data-fullcardplaceholder')),
        fullcardlabels: JSON.parse(method.getAttribute('data-fullcardlabels')),
        labels: JSON.parse(method.getAttribute("data-labels")),
        textUnderAmount: method.getAttribute("data-textunderamount"),
        customfieldplaceholder: method.getAttribute("data-customfieldplaceholder"),
        customfieldlabel: method.getAttribute("data-customfieldlabel"),
        customfieldregex: method.getAttribute("data-customfieldregex"),
        customFieldValidationMsg: method.getAttribute("data-customfieldtitle"),
        token: method.getAttribute("data-token")
    }
}

function isCardValid(element) {
    let value = element.value;

    if (/[^0-9-\s]+/.test(value)) return false;
    let check = 0;
    let even = false;
    value = value.replace(/\D/g, "");

    for (let n = value.length - 1; n >= 0; n--) {
        let digitAtN = value.charAt(n);
        let digitAsInt = parseInt(digitAtN, 10);

        if (even) {
            if ((digitAsInt *= 2) > 9) digitAsInt -= 9;
        }
        check += digitAsInt;
        even = !even;
    }
    if ((check % 10) === 0) {
        element.classList.remove('has-error');
    } else {
        element.classList.add('has-error');
    }
}

function updateCoordinates(latitude, longitude) {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
                console.log("Got geolocation: " + position.coords.latitude + ", " + position.coords.longitude)
                latitude.value = position.coords.latitude;
                longitude.value = position.coords.longitude;
            },
            function () {
                console.log("Something went wrong");
            }
        );
    } else {
        console.error("No support for geolocation api");
    }
}