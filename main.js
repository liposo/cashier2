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

    //<div id="selectedMethod" class="method-container">
    var selectedMethod = document.createElement("div");
    selectedMethod.className = "method-container";
    selectedMethod.id = methodData.id;

    //<form id="cashierForm" class="form-wrapper">
    var form = document.createElement("form");
    form.id = "cashierForm";
    form.classList = "form-wrapper";
    form.appendChild(buildLogoAmountRow(methodData));

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
    // event listener to select radio on field focus and assignm input value to radio value.
    manualamountInput.addEventListener("click", function() {
        manualAmountRadio.checked = true;
        manualAmountRadio.value= this.value;
    });
    manualamountInput.addEventListener("change", function() {
        manualAmountRadio.value= this.value;
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
        amountlabel: method.getAttribute('data-amountlabel')
    }
}