#!/usr/bin/env ts-node

require('dotenv').config({ path: `${__dirname}/../.env.development` });

const { createClient } = require('@supabase/supabase-js');
const { faker } = require('@faker-js/faker');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase URL or service key is not defined in .env.development');
}

const supabase = createClient(supabaseUrl, supabaseKey);

const createRandomEvent = () => {
  const eventTypes = ['produccionOK', 'colocacion', 'medicion', 'otros'];
  const statuses = ['Pendiente', 'Finalizado', 'Cancelado'];
  return {
    type: faker.helpers.arrayElement(eventTypes),
    description: faker.lorem.sentence(),
    title: faker.lorem.words(3),
    client: faker.person.fullName(),
    location: faker.location.city(),
    date: faker.date.future(),
    address: faker.location.streetAddress(),
    status: faker.helpers.arrayElement(statuses),
  };
};

const seedEvents = async () => {
  console.log('Deleting existing events...');
  const { error: deleteError } = await supabase.from('events').delete().neq('id', 0);

  if (deleteError) {
    console.error('Error deleting existing events:', deleteError);
    return;
  }
  console.log('Successfully deleted existing events.');

  console.log('Starting to seed 50 new events...');
  for (let i = 0; i < 50; i++) {
    const event = createRandomEvent();
    const { data, error } = await supabase.from('events').insert(event);

    if (error) {
      console.error(`Error seeding event ${i + 1}:`, error);
      console.error('Event data:', event);
      return; // Stop on first error
    } else {
      console.log(`Successfully seeded event ${i + 1}/50`);
    }
  }
  console.log('Finished seeding 50 events.');
};

seedEvents();

export {};
