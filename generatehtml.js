const fs = require('fs');
const path = require('path');
const moment = require('moment');

function generateHTML(data, submissionId) {
    try {
        console.log(data);

        // Read and modify the HTML template
        let html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
        html = html.replace('{{full name}}', data['devlly_fullname']);
        html = html.replace('{{E-mail}}', data['devlly_email']);
        html = html.replace('{{Telephone}}', data['devlly_phone']);
        html = html.replace('{{date}}', moment().format('DD-MM-YYYY'));
        html = html.replace('{{id_devis}}', submissionId);

        let tableData = [];

        switch (data['devlly_website_type']) {
            case "ecommerce":
                if (data["devlly_isGros"] === "Vente en gros")
                    tableData.push({ description: "E-commerce Website Development", quantity: 1, price: 100000 });
                else if (data["devlly_isGros"] === "Vente au détail")
                    tableData.push({ description: "E-commerce Website Development", quantity: 1, price: 60000 });
                else
                    tableData.push({ description: "E-commerce Website Development", quantity: 1, price: 120000 });
                break;

            case "Site éducatif (LMS)":
                switch (data["devlly_lms_type_courses"]) {
                    case "Présentiel":
                        tableData.push({ description: "Développement de Site Éducatif (LMS) - Présentiel", quantity: 1, price: 80000 });
                        break;
                    case "En ligne":
                        tableData.push({ description: "Développement de Site Éducatif (LMS) - En ligne", quantity: 1, price: 50000 });
                        break;
                    case "Les deux":
                        tableData.push({ description: "Développement de Site Éducatif (LMS) - Présentiel + En ligne", quantity: 1, price: 70000 });
                        break;
                    default:
                        tableData.push({ description: "Développement de Site Éducatif (LMS)", quantity: 1, price: 60000 });
                        break;
                }
                break;

            case "Landing page":
                tableData.push({ description: "Landing Page Development", quantity: 1, price: 10000 });
                break;

            case "Portfolio":
                tableData.push({ description: "Portfolio Website Development", quantity: 1, price: 30000 });
                break;

            case "Blog":
                tableData.push({ description: "Blog Website Development", quantity: 1, price: 60000 });
                break;

            case "Site pour business":
                switch (data["devlly_buisness_type"]) {
                    case "Agence de voyage":
                        let travelAgencyPrice = 0;
                        if (data["devlly_immob_services_types"].includes("Hôtels")) travelAgencyPrice += 15000;
                        if (data["devlly_immob_services_types"].includes("Billets d'avions")) travelAgencyPrice += 20000;
                        if (data["devlly_immob_services_types"].includes("Voyages organisées")) travelAgencyPrice += 25000;
                        if (data["devlly_immob_services_types"].includes("Tours")) travelAgencyPrice += 10000;
                        if (data["devlly_immob_services_types"].includes("Traitement Visa")) travelAgencyPrice += 30000;

                        tableData.push({
                            description: "Développement de Site pour Agence de voyage",
                            quantity: 1,
                            price: travelAgencyPrice
                        });
                        break;

                    case "Agence immobilière":
                        if (data["devlly_immob_type"] === "site web uniquement vitrine") {
                            tableData.push({
                                description: "Développement de Site pour Agence immobilière (Vitrine)",
                                quantity: 1,
                                price: 80000
                            });
                        } else if (data["devlly_immob_type"] === "Avec un système de gestion immobilière") {
                            tableData.push({
                                description: "Développement de Site pour Agence immobilière (Système de gestion)",
                                quantity: 1,
                                price: 180000
                            });
                        } else {
                            tableData.push({
                                description: "Développement de Site pour Agence immobilière",
                                quantity: 1,
                                price: 50000
                            });
                        }
                        break;

                    default:
                        tableData.push({
                            description: "Développement de Site pour Business",
                            quantity: 1,
                            price: 40000
                        });
                        break;
                }
                break;

            default:
                tableData.push({ description: "Standard Website Development", quantity: 1, price: 99999 });
                break;
        }

        // Define extra services with their prices
        const extraServices = [
            { name: "Payement en ligne par Edahabia/CIB", description: "Payement en ligne par Edahabia/CIB", price: 20000 },
            { name: "Payement en ligne par Visa/ MasterCard /PayPal", description: "Payement en ligne par Visa/MasterCard/PayPal", price: 30000 },
            { name: "Multilingue", description: "Site multilingue", price: 5000 },
            { name: "blog", description: "Intégration d'un blog", price: 15000 },
            { name: "optimisation SEO avancé", description: "Optimisation SEO avancée", price: 20000 },
            { name: "Intégration des sociétés de livraison", description: "Intégration des sociétés de livraison", price: 8000 },
            {
                name: "Intégration pixel",
                description: data["devlly_pixel"] && data["devlly_pixel"].length > 0
                    ? `Intégration de pixels ${data["devlly_pixel"].join(', ')}`
                    : "Intégration de pixels (Aucune plateforme spécifiée)",
                price: data["devlly_pixel"] && data["devlly_pixel"].length > 0
                    ? 3000 * data["devlly_pixel"].length
                    : 3000
            },
            {
                name: "Design des landing pages",
                description: `Design des landing pages (${data["devlly_landingpage_num_1"] || 1})`,
                price: data["devlly_landingpage_num_1"]
                    ? 2000 * data["devlly_landingpage_num_1"]
                    : 2000
            },
            { name: "intégrations spécifiques avec des outils existants", description: "Intégrations spécifiques avec des outils existants", price: 0 }
        ];

        // Check and add selected extra services
        if (data["devlly_services_extra"]) {
            let extraServicesNames = [];
            let totalExtraServicesPrice = 0;

            data["devlly_services_extra"].forEach(service => {
                const selectedService = extraServices.find(extra => extra.name === service);
                if (selectedService) {
                    extraServicesNames.push(selectedService.name);
                    totalExtraServicesPrice += selectedService.price;
                }
            });

            if (extraServicesNames.length > 0) {
                const description = `Extra services (${extraServicesNames.join(', ')})`;
                tableData.push({ description: description, quantity: 1, price: totalExtraServicesPrice });
            }
        }

        // Add other standard services
        tableData.push({ description: "Optimisation SEO basic", quantity: 1, price: "Gratuite" });
        tableData.push({ description: "Maintenance et Support (1 an)", quantity: 1, price: "Gratuite" });
        tableData.push({ description: "Hébergement et Nom de Domaine (1 an)", quantity: 1, price: "Gratuite" });

        // Calculate the total price (only sum numeric values)
        let totalPrice = tableData.reduce((total, item) => {
            return typeof item.price === 'number' ? total + item.price : total;
        }, 0);
        totalPrice = dot(totalPrice) + " DA";

        // Construct the data table
        let dataTable = "<tbody>";
        tableData.forEach((item, index) => {
            const highlightClass = (index % 2 === 1) ? "class='highlight'" : "";
            dataTable += `
                <tr ${highlightClass}>
                    <td>${item.description}</td>
                    <td>${item.quantity}</td>
                    <td>${typeof item.price === 'number' ? dot(item.price) + " DA" : item.price}</td>
                </tr>
            `;
        });
        dataTable += `</tbody>
        <tfoot>
        <tr>
            <td colspan="2">TOTALE</td>
            <td class="price-column">${totalPrice}</td>
        </tr>
        </tfoot>`;

        // Replace the placeholder in the HTML with the data table
        html = html.replace('{{datatable}}', dataTable);
        return html;
    } catch (error) {
        console.error('Error generating HTML:', error);
        throw new Error('Failed to generate HTML content.');
    }
}

module.exports = { generateHTML };
