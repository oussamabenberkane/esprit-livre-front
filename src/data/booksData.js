// Shared books database - centralized data source
// In production, this would be replaced with API calls

export const BOOKS_DATA = [
    {
        id: 1,
        title: "Les ombres du monde",
        author: {
            id: 1,
            name: "Michel Bussi"
        },
        price: "2000",
        stockQuantity: 10,
        coverImageUrl: "../public/assets/books/ouss.jpg",
        description: "Un thriller captivant qui vous tiendra en haleine jusqu'à la dernière page. Michel Bussi nous plonge dans une intrigue haletante où chaque page révèle un nouveau mystère. Les personnages sont profondément humains, leurs motivations complexes, et le suspense est maintenu jusqu'au dénouement final qui vous laissera sans voix.",
        estimatedDelivery: "27/09/2025",
        condition: "neuf",
        seller: "Esprit Livre",
        language: "French",
        active: true,
        createdAt: "2025-10-07T19:56:52.198094+02:00",
        updatedAt: null,
        tags: [
            {
                id: 1,
                nameEn: "Fiction",
                nameFr: "Fiction",
                type: "CATEGORY",
                active: true,
                colorHex: null
            },
            {
                id: 11,
                nameEn: "Bestseller",
                nameFr: "coup de cœur",
                type: "ETIQUETTE",
                active: true,
                colorHex: "#EF4444"
            }
        ],
        likeCount: null,
        isLikedByCurrentUser: false
    },
    {
        id: 2,
        title: "Crime et Châtiment",
        author: {
            id: 2,
            name: "Fiodor Dostoïevski"
        },
        price: "2500",
        stockQuantity: 5,
        coverImageUrl: "../public/assets/books/crime.jpg",
        description: "Un chef-d'œuvre de la littérature russe qui explore les profondeurs de l'âme humaine. Dostoïevski nous plonge dans l'esprit tourmenté de Raskolnikov, un étudiant qui commet un meurtre et doit ensuite faire face aux conséquences morales et psychologiques de son acte.",
        estimatedDelivery: "28/09/2025",
        condition: "neuf",
        seller: "Esprit Livre",
        language: "French",
        active: true,
        createdAt: "2025-10-07T19:56:52.198094+02:00",
        updatedAt: null,
        tags: [
            {
                id: 1,
                nameEn: "Fiction",
                nameFr: "Fiction",
                type: "CATEGORY",
                active: true,
                colorHex: null
            },
            {
                id: 11,
                nameEn: "Bestseller",
                nameFr: "Précommande",
                type: "ETIQUETTE",
                active: true,
                colorHex: "#3B82F6"
            }
        ],
        likeCount: null,
        isLikedByCurrentUser: false
    },
    {
        id: 3,
        title: "Où les étoiles tombent",
        author: {
            id: 3,
            name: "Cédric Sapin-Defour"
        },
        price: "2500",
        stockQuantity: 15,
        coverImageUrl: "../public/assets/books/ouss.jpg",
        description: "Un roman poétique et touchant qui explore les thèmes de l'amour, de la perte et de l'espoir. Cédric Sapin-Defour tisse une histoire délicate où les destins s'entrecroisent sous un ciel étoilé, rappelant à chacun que même dans les moments les plus sombres, la lumière peut toujours percer.",
        estimatedDelivery: "25/09/2025",
        condition: "neuf",
        seller: "Esprit Livre",
        language: "Arabic",
        active: true,
        createdAt: "2025-10-08T10:30:00.000000+02:00",
        updatedAt: null,
        tags: [
            {
                id: 2,
                nameEn: "Romance",
                nameFr: "Romance",
                type: "CATEGORY",
                active: true,
                colorHex: null
            },
            {
                id: 12,
                nameEn: "New Release",
                nameFr: "Nouveauté",
                type: "ETIQUETTE",
                active: true,
                colorHex: "#10B981"
            }
        ],
        likeCount: null,
        isLikedByCurrentUser: true
    },
    {
        id: 4,
        title: "Le Cercle des jours",
        author: {
            id: 4,
            name: "Ken Follett"
        },
        price: "2590",
        stockQuantity: 0,
        coverImageUrl: "../public/assets/books/crime.jpg",
        description: "Une épopée historique fascinante qui nous transporte à travers les siècles. Ken Follett démontre une fois de plus son talent pour mêler faits historiques et fiction captivante. Une fresque grandiose qui fait revivre des époques révolues avec une précision et une passion remarquables.",
        estimatedDelivery: "05/10/2025",
        condition: "neuf",
        seller: "Esprit Livre",
        language: "English",
        active: true,
        createdAt: "2025-10-09T14:15:00.000000+02:00",
        updatedAt: null,
        tags: [
            {
                id: 3,
                nameEn: "Historical",
                nameFr: "Historique",
                type: "CATEGORY",
                active: true,
                colorHex: null
            },
            {
                id: 11,
                nameEn: "Bestseller",
                nameFr: "coup de cœur",
                type: "ETIQUETTE",
                active: true,
                colorHex: "#EF4444"
            }
        ],
        likeCount: null,
        isLikedByCurrentUser: false
    },
    {
        id: 5,
        title: "L'Étranger",
        author: {
            id: 5,
            name: "Albert Camus"
        },
        price: "1800",
        stockQuantity: 8,
        coverImageUrl: "../public/assets/books/ouss.jpg",
        description: "Un chef-d'œuvre de la littérature existentialiste qui questionne le sens de l'existence et l'absurdité de la condition humaine. Albert Camus crée un personnage inoubliable, Meursault, dont l'indifférence face au monde qui l'entoure force le lecteur à s'interroger sur ses propres valeurs.",
        estimatedDelivery: "22/09/2025",
        condition: "neuf",
        seller: "Esprit Livre",
        language: "French",
        active: true,
        createdAt: "2025-10-10T09:45:00.000000+02:00",
        updatedAt: null,
        tags: [
            {
                id: 4,
                nameEn: "Philosophy",
                nameFr: "Philosophie",
                type: "CATEGORY",
                active: true,
                colorHex: null
            },
            {
                id: 12,
                nameEn: "New Release",
                nameFr: "Nouveauté",
                type: "ETIQUETTE",
                active: true,
                colorHex: "#10B981"
            }
        ],
        likeCount: null,
        isLikedByCurrentUser: false
    },
    {
        id: 6,
        title: "Les Misérables",
        author: {
            id: 6,
            name: "Victor Hugo"
        },
        price: "3200",
        stockQuantity: 12,
        coverImageUrl: "../public/assets/books/crime.jpg",
        description: "Un monument de la littérature française qui raconte l'histoire de Jean Valjean, un ancien bagnard en quête de rédemption. Victor Hugo y dépeint avec maestria la société française du XIXe siècle, ses injustices et ses combats pour la dignité humaine.",
        estimatedDelivery: "30/09/2025",
        condition: "neuf",
        seller: "Esprit Livre",
        language: "Arabic",
        active: true,
        createdAt: "2025-10-11T11:20:00.000000+02:00",
        updatedAt: null,
        tags: [
            {
                id: 5,
                nameEn: "Classic",
                nameFr: "Classique",
                type: "CATEGORY",
                active: true,
                colorHex: null
            },
            {
                id: 11,
                nameEn: "Bestseller",
                nameFr: "coup de cœur",
                type: "ETIQUETTE",
                active: true,
                colorHex: "#EF4444"
            }
        ],
        likeCount: null,
        isLikedByCurrentUser: false
    },
    {
        id: 7,
        title: "1984",
        author: {
            id: 7,
            name: "George Orwell"
        },
        price: "2200",
        stockQuantity: 20,
        coverImageUrl: "../public/assets/books/ouss.jpg",
        description: "Un roman dystopique visionnaire qui dépeint un monde totalitaire où la surveillance est omniprésente. George Orwell crée une œuvre prophétique qui résonne encore aujourd'hui avec une pertinence troublante sur les dangers du pouvoir absolu.",
        estimatedDelivery: "24/09/2025",
        condition: "neuf",
        seller: "Esprit Livre",
        language: "English",
        active: true,
        createdAt: "2025-10-12T08:00:00.000000+02:00",
        updatedAt: null,
        tags: [
            {
                id: 6,
                nameEn: "Science Fiction",
                nameFr: "Science-Fiction",
                type: "CATEGORY",
                active: true,
                colorHex: null
            },
            {
                id: 12,
                nameEn: "New Release",
                nameFr: "Nouveauté",
                type: "ETIQUETTE",
                active: true,
                colorHex: "#10B981"
            }
        ],
        likeCount: null,
        isLikedByCurrentUser: true
    },
    {
        id: 8,
        title: "Le Petit Prince",
        author: {
            id: 8,
            name: "Antoine de Saint-Exupéry"
        },
        price: "1500",
        stockQuantity: 30,
        coverImageUrl: "../public/assets/books/crime.jpg",
        description: "Un conte philosophique et poétique qui touche les cœurs de tous les âges. À travers les aventures d'un jeune prince venu d'une autre planète, Saint-Exupéry nous livre une réflexion profonde sur l'amour, l'amitié et le sens de la vie.",
        estimatedDelivery: "20/09/2025",
        condition: "neuf",
        seller: "Esprit Livre",
        language: "Arabic",
        active: true,
        createdAt: "2025-10-13T15:30:00.000000+02:00",
        updatedAt: null,
        tags: [
            {
                id: 9,
                nameEn: "Children's Literature",
                nameFr: "Littérature Jeunesse",
                type: "CATEGORY",
                active: true,
                colorHex: null
            },
            {
                id: 11,
                nameEn: "Bestseller",
                nameFr: "coup de cœur",
                type: "ETIQUETTE",
                active: true,
                colorHex: "#EF4444"
            }
        ],
        likeCount: null,
        isLikedByCurrentUser: false
    }
];

// Helper function to get language code (abbreviated)
export const getLanguageCode = (language) => {
    const languageMap = {
        'French': 'fr',
        'English': 'eng',
        'Arabic': 'arb'
    };
    return languageMap[language] || language.toLowerCase();
};

// Helper function to get full language name
export const getFullLanguageName = (language) => {
    const languageMap = {
        'French': 'Français',
        'English': 'English',
        'Arabic': 'عربية'
    };
    return languageMap[language] || language;
};

// Helper function to get book by ID
export const getBookById = (id) => {
    return BOOKS_DATA.find(book => book.id === parseInt(id));
};

// Helper function to get recommended books (exclude current book)
export const getRecommendedBooks = (currentBookId, limit = 4) => {
    return BOOKS_DATA
        .filter(book => book.id !== parseInt(currentBookId))
        .slice(0, limit);
};
