const express = require('express');
const { Module } = require('../models/courseModel');
const router = express.Router();

// Get all modules
router.get('/', async (req, res) => {
  try {
    const { search, creditValue, year } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { moduleTitle: { $regex: search, $options: 'i' } },
        { moduleCode: { $regex: search, $options: 'i' } }
      ];
    }

    if (creditValue) {
      query.creditValue = parseInt(creditValue);
    }

    if (year) {
      query.courseYear = parseInt(year);
    }

    const modules = await Module.find(query)
      .select('moduleCode moduleTitle creditValue courseYear semester')
      .sort({ moduleCode: 1 });

    res.json({
      success: true,
      count: modules.length,
      data: modules
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching modules',
      error: error.message
    });
  }
});

// Get specific module
router.get('/:moduleCode', async (req, res) => {
  try {
    const module = await Module.findOne({ moduleCode: req.params.moduleCode });
    
    if (!module) {
      return res.status(404).json({
        success: false,
        message: 'Module not found'
      });
    }

    // Get prerequisite modules
    const prerequisites = await Module.find({ 
      moduleCode: { $in: module.prerequisites } 
    }).select('moduleCode moduleTitle creditValue');

    // Get modules that have this module as a prerequisite
    const dependents = await Module.find({ 
      prerequisites: module.moduleCode 
    }).select('moduleCode moduleTitle creditValue');

    res.json({
      success: true,
      data: {
        module,
        prerequisites,
        dependents
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching module details',
      error: error.message
    });
  }
});

// Get module prerequisites graph
router.get('/:moduleCode/prerequisites', async (req, res) => {
  try {
    const module = await Module.findOne({ moduleCode: req.params.moduleCode });
    
    if (!module) {
      return res.status(404).json({
        success: false,
        message: 'Module not found'
      });
    }

    // Recursively get all prerequisites
    const visited = new Set();
    const nodes = [];
    const edges = [];

    const addModuleAndPrereqs = async (moduleCode, depth = 0) => {
      if (visited.has(moduleCode) || depth > 5) return; // Prevent infinite loops
      
      visited.add(moduleCode);
      const currentModule = await Module.findOne({ moduleCode });
      
      if (!currentModule) return;

      nodes.push({
        id: currentModule.moduleCode,
        label: currentModule.moduleTitle,
        type: 'module',
        depth,
        data: {
          moduleCode: currentModule.moduleCode,
          moduleTitle: currentModule.moduleTitle,
          creditValue: currentModule.creditValue,
          summaryOfContents: currentModule.summaryOfContents
        }
      });

      for (const prereqCode of currentModule.prerequisites) {
        edges.push({
          id: `${prereqCode}-${currentModule.moduleCode}`,
          source: prereqCode,
          target: currentModule.moduleCode,
          type: 'prerequisite'
        });
        
        await addModuleAndPrereqs(prereqCode, depth + 1);
      }
    };

    await addModuleAndPrereqs(req.params.moduleCode);

    res.json({
      success: true,
      data: {
        nodes,
        edges
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching module prerequisites',
      error: error.message
    });
  }
});

module.exports = router;
