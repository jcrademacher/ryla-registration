

export const EMAIL_REGEX = /^(?!\.)(?!.*\.\.)([a-z0-9_'+\-\.]*)[a-z0-9_'+\-]@([a-z0-9][a-z0-9\-]*\.)+[a-z]{2,}$/i;

export const PHONE_REGEX = /^[0-9]{10}$/;

export const DIETARY_RESTRICTIONS = [
    "None",
    "Vegan",
    "Vegetarian",
    "Nut/Peanut Allergy",
    "Lactose Intolerant",
    "Halal",
    "Kosher",
    "Gluten-free"
];

export const GENDER_OPTIONS = [
    "Male",
    "Female"
];
