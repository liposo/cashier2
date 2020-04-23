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
    selectedMethod.id = methodData.id;

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
    switch (methodData.customfield) {
        case "fullCard":
            paymentDataRow.appendChild(buildFullCard(methodData));
            break;
        case "cardPan":
        case "phone":
        case "accountId":
            // paymentDataRow.appendChild(buildCustomField(methodData));
            break;
        default:
    }
    form.appendChild(paymentDataRow);

    // append submit form row
    form.appendChild(buildSubmitFormRow(methodData));

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
};

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

    } else if (method.amount) {
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
    amountLabel.innerHTML = method.amountlabel + ": ";
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
    manualamountInput.name = "amount";
    manualamountInput.type = "text";
    manualamountInput.value = method.defaultamount;
    manualamountInput.placeholder = "Need to update later" //TODO get text from data-amountplaceholder

    // event listener to select radio on field focus and assign input value to radio value.
    manualamountInput.addEventListener("click", function () {
        manualAmountRadio.checked = true;
        manualAmountRadio.value = this.value;
    });
    manualamountInput.addEventListener("change", function () {
        manualAmountRadio.value = this.value;
    });

    //<p class="">Small text under the amount input</p>
    var textUnderAmountInput = document.createElement("p");
    textUnderAmountInput.innerHTML = "Need to update later"; //TODO get text from data-textunderamount

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
    manualAmount.classList = "manual-amount";

    //<input class="text-input has-error" name="amount" id="manualAmountInput" type="text" placeholder="Amount" />
    var manualamountInput = document.createElement("input");
    manualamountInput.classList = "amount";
    manualamountInput.id = "manualAmountInput";
    manualamountInput.name = "amount";
    manualamountInput.type = "text";
    manualamountInput.value = method.defaultamount;
    manualamountInput.placeholder = "Need to update later" //get text from data-amountplaceholder

    //<p class="">Small text under the amount input</p>
    var textUnderAmountInput = document.createElement(p);
    textUnderAmountInput.innerHTML = "Need to update later"; //get text from data-textunderamount

    manualamount.appendChild(manualamountInput);
    manualamount.appendChild(textUnderAmountInput);

    manualAmountRow.appendChild(manualamount);

    return manualAmountRow
}

function buildFullCard(method) {
    var labels = method.fullcardlabels.split(":");
    var placeholders = method.fullcardplaceholder.split(":");

    //<div class="payment-data-fields-container">
    var paymentFieldsContainer = document.createElement("div");
    paymentFieldsContainer.classList = "payment-data-fields-container";

    paymentFieldsContainer.appendChild(buildInput("input-container",
        "card.number",
        "text-input cardPan",
        labels[0] != undefined ? labels[0] : "Card Number",
        "input-label",
        placeholders[0] != undefined ? placeholders[0] : "Card Number",
        method
    ));

    paymentFieldsContainer.appendChild(buildInput("input-container",
        "card.holder",
        "text-input",
        labels[1] != undefined ? labels[1] : "Holder Name",
        "input-label",
        placeholders[1] != undefined ? placeholders[1] : "Holder Name",
        method
    ));

    //<div class="date-cvv">
    var dateCvvRow = document.createElement("div");
    dateCvvRow.classList = "date-cvv";

    dateCvvRow.appendChild(buildInput("small-input-wapper",
        "card.expiryMonth",
        "text-input",
        labels[2] != undefined ? labels[2] : "EXP/MM",
        "input-label",
        placeholders[2] != undefined ? placeholders[2] : "MM",
        method));

    dateCvvRow.appendChild(buildInput("small-input-wapper",
        "card.expiryYear",
        "text-input",
        labels[3] != undefined ? labels[3] : "EXP/YY",
        "input-label",
        placeholders[3] != undefined ? placeholders[3] : "YY",
        method));

    dateCvvRow.appendChild(buildInput("small-input-wapper",
        "card.cvv",
        "text-input",
        labels[4] != undefined ? labels[4] : "CVV2/CVC",
        "input-label",
        placeholders[4] != undefined ? placeholders[4] : "CVV2/CVC",
        method));

    paymentFieldsContainer.appendChild(dateCvvRow);

    return paymentFieldsContainer;
}

//This function can be more generic
function buildInput(containerClass, inputName, inputClass, label, labelClass, placeholder, method) {
    //<div class="input-container">
    var inputContainer = document.createElement("div");
    inputContainer.classList = containerClass;

    //<label for="card.number" class="input-label">Card number</label>
    var inputLabel = document.createElement("label");
    inputLabel.htmlFor = inputName;
    inputLabel.classList = labelClass
    inputLabel.innerHTML = label;

    //<input id="card.number" name="card.number" class="text-input has-error" type="text" placeholder="Card Number" />
    var input = document.createElement("input");
    input.type = ("text");
    input.id = inputName;
    input.name = inputName;
    input.classList = inputClass;
    input.placeholder = placeholder;
    if (method.error != undefined) {
        input.classList.add("has-error");
    }

    inputContainer.appendChild(inputLabel);
    inputContainer.appendChild(input);

    //<div class="error">Invalid Card</div>
    if (method.error) {
        inputContainer.appendChild(buildErrorDiv(method));
    }

    return inputContainer
}

function buildCustomField(method) {}

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
    var cancelLink = document.createElement("a");
    cancelLink.classList = "cancel-link mb-8em"
    cancelLink.innerText = method.labels.cancel;
    submitContainer.appendChild(cancelLink);

    if(method.customfield === "fullCard") {
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

    return submitRow;
}

function getMethodData(method) {
    return mathodData = {
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
        customFieldValue: method.getAttribute('data-customfieldvalue'),
        amountrange: method.getAttribute('data-amountrange'),
        amountlabel: method.getAttribute('data-amountlabel'),
        fullcardplaceholder: method.getAttribute('data-fullcardplaceholder'),
        fullcardlabels: method.getAttribute('data-fullcardlabels'),
        labels: JSON.parse(method.getAttribute("data-labels"))
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