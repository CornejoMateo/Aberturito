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

const createRandomClient = () => {
  return {
    name: faker.person.firstName(),
    last_name: faker.person.lastName(),
    phone_number: faker.phone.number(),
    locality: faker.location.city(),
    email: faker.internet.email(),
    notes: [faker.lorem.sentence()],
  };
};

const seedClients = async () => {
  console.log('Starting to seed 50 clients...');
  for (let i = 0; i < 50; i++) {
    const client = createRandomClient();
    const { data, error } = await supabase.from('clients').insert(client);

    if (error) {
      console.error(`Error seeding client ${i + 1}:`, error);
      console.error('Client data:', client);
      return; // Stop on first error
    } else {
      console.log(`Successfully seeded client ${i + 1}/50`);
    }
  }
  console.log('Finished seeding 50 clients.');
};

seedClients();
