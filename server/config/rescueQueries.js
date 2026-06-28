// Direct port of get_rescue_query() from the Python dashboard
const rescueQueries = {
  water: {
    animal_type: 'Dog',
    age_upon_outcome_in_weeks: { $gte: 26, $lte: 156 },
    breed: {
      $regex: '(labrador retriever.*(mix|\\s*/|/)|chesapeake bay retriever|newfoundland)',
      $options: 'i'
    },
    sex_upon_outcome: 'Intact Female',
    outcome_type: { $nin: ['Return to Owner', 'Died', 'Euthanasia'] }
  },
  mountain: {
    animal_type: 'Dog',
    age_upon_outcome_in_weeks: { $gte: 26, $lte: 156 },
    breed: {
      $regex: '(german shepherd|alaskan malamute|old english sheepdog|siberian husky|rottweiler)',
      $options: 'i'
    },
    sex_upon_outcome: 'Intact Male',
    outcome_type: { $nin: ['Return to Owner', 'Died', 'Euthanasia'] }
  },
  disaster: {
    animal_type: 'Dog',
    age_upon_outcome_in_weeks: { $gte: 20, $lte: 300 },
    breed: {
      $regex: '(doberman pinscher|german shepherd|golden retriever|bloodhound|rottweiler)',
      $options: 'i'
    },
    sex_upon_outcome: 'Intact Male',
    outcome_type: { $nin: ['Return to Owner', 'Died', 'Euthanasia'] }
  },
  reset: {}
};

module.exports = rescueQueries;