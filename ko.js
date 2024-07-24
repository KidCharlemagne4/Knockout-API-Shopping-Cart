var startApp = async function () {
    document.getElementById("fetch").disabled = true;
    $(".loader").css("width", "0").css("background-color", "yellow");
    const requestOptions = { method: "GET", redirect: "follow", dataType: "json", };

    var getCategories = await data("https://dummyjson.com/products/categories");

    function formatCurrency(value) {
        return "$" + value.toFixed(2);
    }
    window.formatCurrency = formatCurrency;

    async function data() {
        let response = await fetch("https://dummyjson.com/products/categories", requestOptions);
        const result = await response.json();
        var x = 100 / result.length;
        var i = 0;
        for (let cat in result) {
            
            response = await fetch("https://dummyjson.com/products/category/" + result[cat].slug, requestOptions);
            let products = await response.json();
            result[cat].products = products.products;
            i += x;
            $(".loader").css("width", i + "%");
        }
        $(".data").addClass("done");
        $(".loader").css("background-color", "green");

        return result;
    }

    var CartLine = function () {
        var self = this;
        self.category = ko.observable();
        self.sampleProductCategories = ko.observableArray();
        self.sampleProductCategories(getCategories);
        self.product = ko.observable();
        self.products = ko.observableArray();
        self.products();
        self.quantity = ko.observable(1);
        self.subtotal = ko.pureComputed(function () {
            return self.product() ? self.product().price * parseInt("0" + self.quantity(), 10) : 0;
        });

        self.category.subscribe(function () { self.product(undefined) });
    };

    var Cart = function () {
        var self = this;

        self.lines = ko.observableArray([new CartLine()]);
        self.grandTotal = ko.pureComputed(function () {
            var total = 0;

            $.each(self.lines(), function () {
                total += this.subtotal()
            })
            return total;
        });

        self.addLine = function () { self.lines.push(new CartLine()) };
        self.removeLine = function (line) { self.lines.remove(line) };
        self.save = function () {
            var dataToSave = $.map(self.lines(), function (line) {
                return line.product() ?
                { productName: line.product().title, quantity: line.quantity() }
                : undefined
            });
            alert("Could now send this to server: " + JSON.stringify(dataToSave));
        };
    };
    ko.applyBindings(new Cart());
}