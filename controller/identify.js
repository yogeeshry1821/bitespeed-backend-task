import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const identify = async (req, res) => {
  const { email, phoneNumber } = req.body;

  if (!email && !phoneNumber) {
    return res.status(400).json({ error: 'Either email or phoneNumber must be provided' });
  }

  // Find contacts with the given email or phoneNumber
  const contacts = await prisma.contact.findMany({
    where: {
      OR: [
        { email },
        { phoneNumber }
      ]
    }
  });

  let message = '';
  let primaryContact = null;

  // If no contacts found, create a new primary contact
  if (contacts.length === 0) {
    const newContact = await prisma.contact.create({
      data: {
        email,
        phoneNumber,
        linkPrecedence: 'primary',
      },
    });

    message = 'Created a new primary contact.';
    return res.status(200).json({
      contact: {
        primaryContactId: newContact.id,
        emails: [newContact.email].filter(e => e !== null),
        phoneNumbers: [newContact.phoneNumber].filter(p => p !== null),
        secondaryContactIds: [],
      },
      message
    });
  }

  // Determine the primary contact
  primaryContact = contacts.find(contact => contact.linkPrecedence === 'primary');
  if (!primaryContact) {
    primaryContact = contacts[0];
  }

  // Check if we need to create a secondary contact
  const existingEmails = contacts.map(contact => contact.email);
  const existingPhoneNumbers = contacts.map(contact => contact.phoneNumber);
  const newEmail = email && !existingEmails.includes(email);
  const newPhoneNumber = phoneNumber && !existingPhoneNumbers.includes(phoneNumber);

  if (newEmail || newPhoneNumber) {
    const newSecondaryContact = await prisma.contact.create({
      data: {
        email,
        phoneNumber,
        linkedId: primaryContact.id,
        linkPrecedence: 'secondary',
      },
    });

    contacts.push(newSecondaryContact);
    message = 'Created a new secondary contact.';
  }

  // Update all secondary contacts to point to the correct primary contact
  const secondaryContacts = contacts.filter(contact => contact.id !== primaryContact.id);
  for (const contact of secondaryContacts) {
    if (contact.linkPrecedence !== 'secondary' || contact.linkedId !== primaryContact.id) {
      await prisma.contact.update({
        where: { id: contact.id },
        data: { linkedId: primaryContact.id, linkPrecedence: 'secondary' },
      });
    }
  }

  if (newEmail || newPhoneNumber) {
    const existingPrimaryContact = contacts.find(contact => contact.email === email || contact.phoneNumber === phoneNumber);
    if (existingPrimaryContact && existingPrimaryContact.id !== primaryContact.id) {
      await prisma.contact.update({
        where: { id: existingPrimaryContact.id },
        data: { linkedId: primaryContact.id, linkPrecedence: 'secondary' },
      });
      message = 'Updated an existing primary contact to secondary.';
    }
  }

  // Collect unique emails and phoneNumbers
  const emails = [...new Set([primaryContact.email, ...secondaryContacts.map(contact => contact.email)].filter(e => e !== null))];
  const phoneNumbers = [...new Set([primaryContact.phoneNumber, ...secondaryContacts.map(contact => contact.phoneNumber)].filter(p => p !== null))];
  const secondaryContactIds = secondaryContacts.map(contact => contact.id);

  if (!message) {
    message = 'No new contacts were created. Existing contacts were updated.';
  }

  return res.status(200).json({
    contact: {
      primaryContactId: primaryContact.id,
      emails,
      phoneNumbers,
      secondaryContactIds,
    },
    message
  });
};

export default identify;
