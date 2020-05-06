window.addEventListener("load", function () {
    console.log("Document loaded!")
    var cards = document.querySelectorAll(".card");
    var cashierFormSection = document.getElementById("cashierPaymentForm");
    var methodContainer = document.getElementById("methodsContainer");

    for (var i = 0; i < cards.length; i++) {
        cards[i].addEventListener('click', function () {

            methodContainer.classList = "scrolling-wrapper";

            cashierFormSection.removeChild(cashierFormSection.firstChild);

            buildPaymentForm(cards, cashierFormSection, this);

            //Get and update geolocation if available 
            var latitude = document.querySelector(".latitude");
            var longitude = document.querySelector(".longitude");
            updateCoordinates(latitude, longitude);

            for (var i = 0; i < cards.length; i++) {
                cards[i].classList.add("card-small");
                cards[i].style.display = 'flex';
            }

            this.style.display = 'none';

        }, false);
    }
});

function buildPaymentForm(cards, cashierFormSection, method) {
    var methodData = getMethodData(method);
    console.log(methodData);

    //<div id="selectedMethod" class="method-container">
    var selectedMethod = document.createElement("div");
    selectedMethod.className = "method-container";
    selectedMethod.id = "selected-" + method.id;

    //<form id="cashierForm" class="form-wrapper">
    var form = document.createElement("form");
    form.id = "cashierForm";
    form.classList = "form-wrapper";

    // append logo and amount row
    form.appendChild(buildLogoAmountRow(methodData));

    //<div class="payment-data-row">
    var paymentDataRow = document.createElement("div");
    paymentDataRow.classList = "payment-data-row";

    //append custom field
    if (Object.keys(methodData.customFieldValue).length > 0) {
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

    form.appendChild(paymentDataRow);

    // append submit form row
    form.appendChild(buildSubmitFormRow(methodData));

    // add hidden inputs
    var iframe = window !== window.parent;
    var domain;

    if (iframe) {
        domain = document.location.ancestorOrigins[0].replace(/^https?\:\/\//i, "");
    }

    form.appendChild(buildHiddenInput("paymentMethod", "", methodData.method));
    form.appendChild(buildHiddenInput("customPaymentMethod", "", methodData.custompaymentmethod));
    form.appendChild(buildHiddenInput("currency", "", methodData.currency));
    form.appendChild(buildHiddenInput("_csrf", "", methodData.token));
    form.appendChild(buildHiddenInput("_screenHeight", "screenHeight", screen.height));
    form.appendChild(buildHiddenInput("_screenWidth", "screenWidth", screen.width));
    form.appendChild(buildHiddenInput("_timezone_offset", "timezone_offset", new Date().getTimezoneOffset()));
    form.appendChild(buildHiddenInput("_latitude", "latitude", ""));
    form.appendChild(buildHiddenInput("_longitude", "longitude", ""));
    form.appendChild(buildHiddenInput("_isIframe", "isIframe", iframe.toString()));
    form.appendChild(buildHiddenInput("_domain", "domain", domain));
    form.appendChild(buildHiddenInput("_isJavaEnabled", "javaEnabled", navigator.javaEnabled()));
    form.appendChild(buildHiddenInput("_screenColorDepth", "screenColorDepth", screen.colorDepth));

    selectedMethod.appendChild(form);
    cashierFormSection.appendChild(selectedMethod);

    // CleaveJS
    if (document.querySelector(".amount")) {
        new Cleave('.amount', {
            numeral: true,
            numeralDecimalMark: '.',
            delimiter: ' '
        });
    }

    var cardPanField = document.querySelector(".cardPan");
    if (cardPanField) {
        new Cleave('.cardPan', {
            creditCard: true,
            creditCardStrictMode: true
        });
        cardPanField.addEventListener("blur", function () {
            isCardValid(cardPanField);
        });
    }

    var cardExpiryDate = document.querySelector(".expiry-date");
    if (cardExpiryDate) {
        new Cleave('.expiry-date', {
            date: true,
            datePattern: ['m', 'y']
        });
    }

    var cardCvv = document.querySelector(".cvv");
    if (cardCvv) {
        new Cleave('.cvv', {
            numeral: true,
            numeralDecimalMark: '',
            delimiter: ''
        });
    }

};

function buildHiddenInput(name, className, value) {
    var hiddenInput = document.createElement("input");
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
    var checkboxContainer = document.createElement("label");
    checkboxContainer.classList = "checkbox-container";
    checkboxContainer.innerHTML = label;

    //<input type="checkbox" id="saveData">
    var checkboxInput = document.createElement("input");
    checkboxInput.type = "checkbox";
    checkboxInput.id = "saveData";
    checkboxContainer.name = "saveData";

    //<span class="checkbox-mark">
    var mark = document.createElement("span");
    mark.classList = "checkbox-mark";

    checkboxContainer.appendChild(checkboxInput);
    checkboxContainer.appendChild(mark);

    return checkboxContainer;
}

function buildLogoAmountRow(method) {
    //<div class="logo-amount-row">
    var logoAmountRow = document.createElement("div");
    logoAmountRow.classList = "logo-amount-row";

    logoAmountRow.appendChild(buildLogo(method));
    logoAmountRow.appendChild(buildAmount(method));

    return logoAmountRow;
}

function buildLogo(method) {
    //<div class="form-logo">
    var divLogo = document.createElement("div");
    divLogo.classList = "form-logo";

    //<img src="img/bigwallet.svg">
    var logo = document.createElement("img");
    logo.src = method.logo;

    //<small>10 EUR - EUR</small>
    var amountRangeText = document.createElement("small");
    amountRangeText.innerHTML = method.amountrange;

    divLogo.appendChild(logo);
    divLogo.appendChild(amountRangeText);

    return divLogo;
}

function buildAmount(method) {
    //<div class="amount-container">
    var amountContainerDiv = document.createElement("div");
    amountContainerDiv.classList = "amount-container";

    if (method.predefinedamounts) {
        amountContainerDiv.appendChild(buildPredefinedAmounts(method));
        amountContainerDiv.appendChild(buildRadioManualAmount(method));

    } else if (method.amount.length <= 0) {
        console.log(method.amount.length);
        amountContainerDiv.appendChild(buildManualAmount(method));
    }

    if (method.error) {
        amountContainerDiv.appendChild(buildErrorDiv(method));
    }

    return amountContainerDiv;
}

function buildPredefinedAmounts(method) {
    //<div class="predefined-amount-row">
    var predefinedAmountRowDiv = document.createElement("div");
    predefinedAmountRowDiv.classList = "predefined-amount-row";

    //<span>Amount: </span>
    var amountLabel = document.createElement("label");
    amountLabel.innerHTML = method.labels.amount + ": ";
    predefinedAmountRowDiv.appendChild(amountLabel);

    var predefinedAmounts = method.predefinedamounts.split(":");
    for (var i = 0; i < predefinedAmounts.length; i++) {
        predefinedAmountRowDiv.appendChild(buildPredefinedamountRadio(predefinedAmounts[i]));
    }

    return predefinedAmountRowDiv;
}

function buildPredefinedamountRadio(amount) {
    //<label class="radio-container">
    var customRadio = document.createElement("label");
    customRadio.classList = "radio-container";
    customRadio.innerText = amount;

    //<input id="amount100" name="amount" type="radio" value="100" checked="checked">
    var radioInput = document.createElement("input");
    radioInput.id = "amount" + amount;
    radioInput.name = "cashier.amount";
    radioInput.type = "radio";
    radioInput.value = amount;
    radioInput.required = true;

    //<span class="checkmark"></span>
    var radioCheckmark = document.createElement("span");
    radioCheckmark.classList = "checkmark";

    customRadio.appendChild(radioInput);
    customRadio.appendChild(radioCheckmark);

    return customRadio;
}

function buildRadioManualAmount(method) {
    //<div class="manual-amount-row">
    var manualAmountRow = document.createElement("div");
    manualAmountRow.classList = "manual-amount-row";

    //<label class="radio-container radio-container-manual-amount">
    var customRadioManualAmount = document.createElement("label");
    customRadioManualAmount.classList = "radio-container radio-container-manual-amount";

    //<input id="manualAmountRadio" name="amount" type="radio" value="">
    var manualAmountRadio = document.createElement("input");
    manualAmountRadio.id = "manualAmountRadio";
    manualAmountRadio.name = "cashier.amount";
    manualAmountRadio.type = "radio";
    manualAmountRadio.value = method.defaultamount;
    manualAmountRadio.required = true;

    //<span class="checkmark"></span>
    var manualAmountCheckmark = document.createElement("span");
    manualAmountCheckmark.classList = "checkmark";

    customRadioManualAmount.appendChild(manualAmountRadio);
    customRadioManualAmount.appendChild(manualAmountCheckmark);

    manualAmountRow.appendChild(customRadioManualAmount);

    //<div class="manual-amount">
    var manualAmount = document.createElement("div");
    manualAmount.classList = "manual-amount";

    //<input class="text-input has-error" name="amount" id="manualAmountInput" type="text" placeholder="Amount" />
    var manualamountInput = document.createElement("input");
    manualamountInput.classList = "text-input amount";
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
    var textUnderAmountInput = document.createElement("p");
    textUnderAmountInput.innerHTML = method.textUnderAmount;

    manualAmount.appendChild(manualamountInput);
    manualAmount.appendChild(textUnderAmountInput);

    manualAmountRow.appendChild(manualAmount);

    return manualAmountRow;
}

function buildErrorDiv(method) {
    //<div class="error">Amount out of range</div>   
    var errorDiv = document.createElement("div");
    errorDiv.classList = "error";
    errorDiv.innerHTML = method.error;

    return errorDiv;
}

function buildManualAmount(method) {
    //<div class="amount-container">
    var amountContainerDiv = document.createElement("div");
    amountContainerDiv.classList = "amount-container";

    //<div class="manual-amount-row">
    var manualAmountRow = document.createElement("div");
    manualAmountRow.classList = "manual-amount-row";

    //<div class="manual-amount">
    var manualamount = document.createElement("div");
    manualamount.classList = "manual-amount";

    //<span>Amount: </span>
    var amountLabel = document.createElement("label");
    amountLabel.innerHTML = method.labels.amount;
    amountLabel.classList = "input-label";
    amountLabel.htmlFor = "manualAmountInput";

    //<input class="text-input has-error" name="amount" id="manualAmountInput" type="text" placeholder="Amount" />
    var manualamountInput = document.createElement("input");
    manualamountInput.classList = "text-input amount";
    manualamountInput.id = "manualAmountInput";
    manualamountInput.name = "cashier.amount"
    manualamountInput.type = "text";
    manualamountInput.value = method.defaultamount;
    manualamountInput.placeholder = method.labels.amount;

    //<p class="">Small text under the amount input</p>
    var textUnderAmountInput = document.createElement("p");
    textUnderAmountInput.innerHTML = method.textUnderAmount
    manualamount.appendChild(amountLabel);
    manualamount.appendChild(manualamountInput);
    manualamount.appendChild(textUnderAmountInput);

    manualAmountRow.appendChild(manualamount);

    return manualAmountRow
}

function buildFullCard(method) {
    //<div class="payment-data-fields-container">
    var paymentFieldsContainer = document.createElement("div");
    paymentFieldsContainer.classList = "payment-data-fields-container";

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
    var dateCvvRow = document.createElement("div");
    dateCvvRow.classList = "date-cvv";

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

    return paymentFieldsContainer;
}

function buildSelectSavedData(savedValues, parent, method) {
    //<div class="selectWrapper">
    var selectWrapper = document.createElement("div");
    selectWrapper.classList = "select-wrapper";

    //<div class="select mb-8em" tabindex="1">
    var customSelect = document.createElement("div");
    customSelect.classList = "select mb-8em";
    customSelect.tabIndex = 1;

    var lenght = Object.keys(savedValues).length;
    for (var i = 0; i < lenght; i++) {
        var key = Object.keys(savedValues)[i];
        var value = Object.values(savedValues)[i];

        var selectOption = buildSelectorInput(key, value, i);
        customSelect.appendChild(selectOption);
        customSelect.appendChild(buildSelectLabel(key, value, selectOption, customSelect, method));
    }

    selectWrapper.appendChild(customSelect);
    selectWrapper.appendChild(buildAddNewButton(parent, method));

    return selectWrapper;
}

function buildAddNewButton(parent, method) {
    //<div class="add-new">
    var addNewContainer = document.createElement("div");
    addNewContainer.classList = "add-new";

    //<span>+</span>
    var plusSign = document.createElement("span");
    plusSign.innerHTML = "+";

    //<p class="text-new">Use different account number</p>
    var addNewText = document.createElement("p");
    addNewText.innerHTML = method.labels.addNew;
    addNewText.classList = "text-new";

    addNewContainer.appendChild(plusSign);
    addNewContainer.appendChild(addNewText);

    addNewContainer.addEventListener('click', function () {
        var paymentDataRow = document.querySelector(".payment-data-row");
        var selectWrapper = document.querySelector(".select-wrapper");
        //Remove custom select container
        paymentDataRow.removeChild(selectWrapper);

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
    });

    return addNewContainer;
}

function buildSelectorInput(key, value, position) {
    //<input class="options-select option-input" name="selectors" type="radio" id="opt1" checked>
    var input = document.createElement("input");
    input.type = "radio";
    input.id = value;
    input.value = key;
    input.classList = "options-select option-input";
    input.name = "savedDataSelected";
    input.required = true;
    if (position == 0) {
        input.checked = true;
    }

    return input;
}

function buildSelectLabel(key, value, input, parent, method) {
    //<label for="opt1" class="option">
    var optionLabel = document.createElement("label");
    optionLabel.classList = "option";
    optionLabel.htmlFor = value;

    //<div class="option-content-container">
    var option = document.createElement("div");
    option.classList = "option-content-container";

    //<p>key</p>
    var optionText = document.createElement("p");
    optionText.innerHTML = value;

    //<div class="delete-icon">
    var deleteWrapper = document.createElement("div");
    deleteWrapper.classList = "delete-icon";

    //<img src="img/delete-icon.svg" />
    var deleteIcon = document.createElement("img");
    deleteIcon.src = "img/delete-icon.svg";

    deleteWrapper.appendChild(deleteIcon);

    option.appendChild(optionText);
    option.appendChild(deleteWrapper);

    //delete event listener
    deleteWrapper.addEventListener("click", function () {
        //TODO fetch delete API

        parent.removeChild(input);
        parent.removeChild(optionLabel);

        //TODO remove value from savedValues
        var selectedMethodSavedValues = method.customFieldValue;
        delete selectedMethodSavedValues[key];

        //re-write data attribute with removed value
        var selectedMethod = document.getElementById(method.id);
        selectedMethod.setAttribute("data-customfieldvalue", JSON.stringify(selectedMethodSavedValues));

        var inputs = parent.querySelectorAll("input")
        if (inputs.length != 0) {
            inputs[0].checked = true;
        } else {
            var paymentDataRow = document.querySelector(".payment-data-row");

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

//This function can be more generic
function buildFullCardInput(containerClass, inputName, inputClass, label, placeholder) {
    //<div class="input-container">
    var inputContainer = document.createElement("div");
    inputContainer.classList = containerClass;

    //<label for="card.number" class="input-label">Card number</label>
    var inputLabel = document.createElement("label");
    inputLabel.htmlFor = inputName;
    inputLabel.classList = "input-label";
    inputLabel.innerHTML = label;

    //<input id="card.number" name="card.number" class="text-input has-error" type="text" placeholder="Card Number" />
    var input = document.createElement("input");
    input.type = "text";
    input.id = inputName;
    input.name = inputName;
    input.classList = "text-input " + inputClass;
    input.placeholder = placeholder;
    input.required = true;
    input.autocomplete = "none";

    if (inputName == "card.cvv") {
        input.type = "password";
        input.pattern = "[0-9]{3,4}";
        input.maxLength = "4";
        input.minLength = "3";

        input.addEventListener("change", function () {
            input.value = input.value.replace("/[^0-9]/g", '').replace("/(\..*)\./g", '$1');
        });
    }

    inputContainer.appendChild(inputLabel);
    inputContainer.appendChild(input);

    return inputContainer
}

function buildCustomField(method) {
    //<div class="payment-data-fields-container">
    var paymentFieldsContainer = document.createElement("div");
    paymentFieldsContainer.classList = "payment-data-fields-container";

    //<div class="input-container">
    var inputContainer = document.createElement("div");
    inputContainer.classList = "input-container";

    if (method.customfield == "phone") {
        //<label for="cashier.customInput" class="input-label">Phone Number</label>
        var inputLabel = document.createElement("label");
        inputLabel.htmlFor = "cahier." + method.customfield;
        inputLabel.classList = "input-label"
        inputLabel.innerHTML = method.customfieldlabel;

        //<div class="phone-wrapper">
        var phoneWrapper = document.createElement("div");
        phoneWrapper.classList = "phone-wrapper";

        //<input id="cashier.phoneCountryCode" name="cashier.phoneCountryCode" class="text-input phone-code" type="tel" />
        var countryCodeInput = document.createElement("input");
        countryCodeInput.type = ("tel");
        countryCodeInput.id = "cahier.phoneCountryCode";
        countryCodeInput.name = "cahier.phoneCountryCode";
        countryCodeInput.classList = "text-input phone-code"
        countryCodeInput.placeholder = method.labels.countryCode != undefined ? method.labels.countryCode : "Code";
        countryCodeInput.required = true;
        countryCodeInput.maxLength = 5;

        //<input id="cashier.phone" name="cashier.number" class="text-input phone" type="tel" placeholder="" />
        var phoneInput = document.createElement("input");
        phoneInput.type = ("tel");
        phoneInput.id = "cahier." + method.customfield;
        phoneInput.name = "cahier." + method.customfield;
        phoneInput.classList = "text-input " + method.customfield;
        phoneInput.placeholder = method.customfieldplaceholder;
        phoneInput.required = true;


        phoneWrapper.appendChild(countryCodeInput);
        phoneWrapper.appendChild(phoneInput);

        inputContainer.appendChild(inputLabel);
        inputContainer.appendChild(phoneWrapper);
    } else {
        //<label for="cashier.customInput" class="input-label">Account Id</label>
        var inputLabel = document.createElement("label");
        inputLabel.htmlFor = "cahier." + method.customfield;
        inputLabel.classList = "input-label"
        inputLabel.innerHTML = method.customfieldlabel;

        //<input id="cashier.customInput" name="cashier.customInput" class="text-input has-error" type="text" placeholder="" />
        var input = document.createElement("input");
        input.type = ("text");
        input.id = "cahier." + method.customfield;
        input.name = "cahier." + method.customfield;
        input.classList = "text-input " + method.customfield;
        input.placeholder = method.customfieldplaceholder;
        input.pattern = method.customfieldregex;
        input.required = true;
        input.title = method.customFieldValidationMsg;

        inputContainer.appendChild(inputLabel);
        inputContainer.appendChild(input);
    }

    paymentFieldsContainer.appendChild(inputContainer);

    return paymentFieldsContainer;
}

function buildSubmitFormRow(method) {
    //<div class="submit-row">
    var submitRow = document.createElement("div");
    submitRow.classList = "submit-row";

    //<div class="submit-container">
    var submitContainer = document.createElement("div");
    submitContainer.classList = "submit-container";

    //<button class="submit-button mb-8em">Submit</button>
    var button = document.createElement("button");
    button.id = "cashierFormSubmit"
    button.classList = "submit-button mb-8em";
    button.innerText = method.labels.submit;
    submitContainer.appendChild(button);

    //<a class="cancel-link mb-8em" href="#">Cancel</a>
    // var cancelLink = document.createElement("a");
    // cancelLink.classList = "cancel-link mb-8em"
    // cancelLink.innerText = method.labels.cancel;
    // cancelLink.href = method.cancel;
    // submitContainer.appendChild(cancelLink);

    if (method.customfield === "fullCard") {
        //<div class="cards-brands mb-8em">
        var cardLogos = document.createElement("div");
        cardLogos.classList = "cards-brands mb-8em";

        //<img src="img/cc-images.svg" />
        var cardLogosImg = document.createElement("img");
        cardLogosImg.src = "img/cc-images.svg";
        cardLogos.appendChild(cardLogosImg);
        submitContainer.appendChild(cardLogos);

        //<div class="pci-logo-wrapper mb-8em">
        var pciLogo = document.createElement("div");
        pciLogo.classList = "pci-logo-wrapper mb-8em";

        //<img class="pci-logo" src="img/pci-dss-logo.svg" />
        var pciLogoImg = document.createElement("img");
        pciLogoImg.classList = "pci-logo";
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
    var value = element.value;

    if (/[^0-9-\s]+/.test(value)) return false;
    var check = 0;
    var even = false;
    value = value.replace(/\D/g, "");

    for (var n = value.length - 1; n >= 0; n--) {
        var digitAtN = value.charAt(n);
        var digitAsInt = parseInt(digitAtN, 10);

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
            latitude.value = position.coords.latitude;
            longitude.value = position.coords.longitude;
        });
    } else {
        console.error("No support for geolocation api");
    }
}