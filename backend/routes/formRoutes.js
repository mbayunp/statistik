const express = require('express');
const router = express.Router();
const formController = require('../controllers/formController');

router.get('/', formController.getAllForms); 
router.post('/', formController.createForm); 
router.get('/:slug', formController.getFormBySlug); 
router.delete('/:id', formController.deleteForm);
router.post('/submit', formController.submitResponse); 
router.get('/responses/:formId', formController.getFormResponses); 

module.exports = router;