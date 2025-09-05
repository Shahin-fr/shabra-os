#!/usr/bin/env node

const fs = require('fs');

console.log('🔧 Fixing syntax errors...');

// Function to fix syntax errors
function fixSyntaxErrors(content) {
  let fixedContent = content;

  // Fix incorrect function parameter replacements
  const syntaxFixes = [
    // Fix JSX syntax errors
    { from: /_<motion\.div/g, to: '<motion.div' },
    { from: /_<div/g, to: '<div' },
    { from: /_<Button/g, to: '<Button' },
    { from: /_<span/g, to: '<span' },
    { from: /_<p/g, to: '<p' },
    { from: /_<h/g, to: '<h' },
    { from: /_<input/g, to: '<input' },
    { from: /_<select/g, to: '<select' },
    { from: /_<option/g, to: '<option' },
    { from: /_<textarea/g, to: '<textarea' },
    { from: /_<label/g, to: '<label' },
    { from: /_<form/g, to: '<form' },
    { from: /_<section/g, to: '<section' },
    { from: /_<article/g, to: '<article' },
    { from: /_<header/g, to: '<header' },
    { from: /_<footer/g, to: '<footer' },
    { from: /_<main/g, to: '<main' },
    { from: /_<nav/g, to: '<nav' },
    { from: /_<aside/g, to: '<aside' },
    { from: /_<ul/g, to: '<ul' },
    { from: /_<li/g, to: '<li' },
    { from: /_<ol/g, to: '<ol' },
    { from: /_<dl/g, to: '<dl' },
    { from: /_<dt/g, to: '<dt' },
    { from: /_<dd/g, to: '<dd' },
    { from: /_<table/g, to: '<table' },
    { from: /_<tr/g, to: '<tr' },
    { from: /_<td/g, to: '<td' },
    { from: /_<th/g, to: '<th' },
    { from: /_<thead/g, to: '<thead' },
    { from: /_<tbody/g, to: '<tbody' },
    { from: /_<tfoot/g, to: '<tfoot' },
    { from: /_<caption/g, to: '<caption' },
    { from: /_<colgroup/g, to: '<colgroup' },
    { from: /_<col/g, to: '<col' },
    { from: /_<img/g, to: '<img' },
    { from: /_<video/g, to: '<video' },
    { from: /_<audio/g, to: '<audio' },
    { from: /_<source/g, to: '<source' },
    { from: /_<track/g, to: '<track' },
    { from: /_<canvas/g, to: '<canvas' },
    { from: /_<svg/g, to: '<svg' },
    { from: /_<path/g, to: '<path' },
    { from: /_<circle/g, to: '<circle' },
    { from: /_<rect/g, to: '<rect' },
    { from: /_<line/g, to: '<line' },
    { from: /_<polygon/g, to: '<polygon' },
    { from: /_<polyline/g, to: '<polyline' },
    { from: /_<ellipse/g, to: '<ellipse' },
    { from: /_<g/g, to: '<g' },
    { from: /_<defs/g, to: '<defs' },
    { from: /_<clipPath/g, to: '<clipPath' },
    { from: /_<mask/g, to: '<mask' },
    { from: /_<pattern/g, to: '<pattern' },
    { from: /_<linearGradient/g, to: '<linearGradient' },
    { from: /_<radialGradient/g, to: '<radialGradient' },
    { from: /_<stop/g, to: '<stop' },
    { from: /_<text/g, to: '<text' },
    { from: /_<tspan/g, to: '<tspan' },
    { from: /_<textPath/g, to: '<textPath' },
    { from: /_<use/g, to: '<use' },
    { from: /_<symbol/g, to: '<symbol' },
    { from: /_<marker/g, to: '<marker' },
    { from: /_<foreignObject/g, to: '<foreignObject' },
    { from: /_<switch/g, to: '<switch' },
    { from: /_<g/g, to: '<g' },
    { from: /_<a/g, to: '<a' },
    { from: /_<link/g, to: '<link' },
    { from: /_<meta/g, to: '<meta' },
    { from: /_<title/g, to: '<title' },
    { from: /_<style/g, to: '<style' },
    { from: /_<script/g, to: '<script' },
    { from: /_<noscript/g, to: '<noscript' },
    { from: /_<template/g, to: '<template' },
    { from: /_<slot/g, to: '<slot' },
    { from: /_<portal/g, to: '<portal' },
    { from: /_<suspense/g, to: '<suspense' },
    { from: /_<fragment/g, to: '<fragment' },
    { from: /_<provider/g, to: '<provider' },
    { from: /_<consumer/g, to: '<consumer' },
    { from: /_<context/g, to: '<context' },
    { from: /_<error/g, to: '<error' },
    { from: /_<boundary/g, to: '<boundary' },
    { from: /_<lazy/g, to: '<lazy' },
    { from: /_<memo/g, to: '<memo' },
    { from: /_<forwardRef/g, to: '<forwardRef' },
    { from: /_<createElement/g, to: '<createElement' },
    { from: /_<cloneElement/g, to: '<cloneElement' },
    { from: /_<isValidElement/g, to: '<isValidElement' },
    { from: /_<createContext/g, to: '<createContext' },
    { from: /_<useContext/g, to: '<useContext' },
    { from: /_<useReducer/g, to: '<useReducer' },
    { from: /_<useState/g, to: '<useState' },
    { from: /_<useEffect/g, to: '<useEffect' },
    { from: /_<useLayoutEffect/g, to: '<useLayoutEffect' },
    { from: /_<useCallback/g, to: '<useCallback' },
    { from: /_<useMemo/g, to: '<useMemo' },
    { from: /_<useRef/g, to: '<useRef' },
    { from: /_<useImperativeHandle/g, to: '<useImperativeHandle' },
    { from: /_<useDebugValue/g, to: '<useDebugValue' },
    { from: /_<useId/g, to: '<useId' },
    { from: /_<useDeferredValue/g, to: '<useDeferredValue' },
    { from: /_<useTransition/g, to: '<useTransition' },
    { from: /_<useSyncExternalStore/g, to: '<useSyncExternalStore' },
    { from: /_<useInsertionEffect/g, to: '<useInsertionEffect' },
    { from: /_<use/g, to: '<use' },
    { from: /_<startTransition/g, to: '<startTransition' },
    { from: /_<flushSync/g, to: '<flushSync' },
    { from: /_<unstable_batchedUpdates/g, to: '<unstable_batchedUpdates' },
    { from: /_<unstable_createRoot/g, to: '<unstable_createRoot' },
    { from: /_<unstable_createRoot/g, to: '<unstable_createRoot' },
    { from: /_<unstable_flushControlled/g, to: '<unstable_flushControlled' },
    { from: /_<unstable_runWithPriority/g, to: '<unstable_runWithPriority' },
    { from: /_<unstable_scheduleCallback/g, to: '<unstable_scheduleCallback' },
    { from: /_<unstable_cancelCallback/g, to: '<unstable_cancelCallback' },
    { from: /_<unstable_wrapCallback/g, to: '<unstable_wrapCallback' },
    { from: /_<unstable_getCurrentPriorityLevel/g, to: '<unstable_getCurrentPriorityLevel' },
    { from: /_<unstable_shouldYield/g, to: '<unstable_shouldYield' },
    { from: /_<unstable_requestPaint/g, to: '<unstable_requestPaint' },
    { from: /_<unstable_now/g, to: '<unstable_now' },
    { from: /_<unstable_getFirstCallbackNode/g, to: '<unstable_getFirstCallbackNode' },
    { from: /_<unstable_ImmediatePriority/g, to: '<unstable_ImmediatePriority' },
    { from: /_<unstable_UserBlockingPriority/g, to: '<unstable_UserBlockingPriority' },
    { from: /_<unstable_NormalPriority/g, to: '<unstable_NormalPriority' },
    { from: /_<unstable_LowPriority/g, to: '<unstable_LowPriority' },
    { from: /_<unstable_IdlePriority/g, to: '<unstable_IdlePriority' },
    { from: /_<unstable_NoPriority/g, to: '<unstable_NoPriority' },
    { from: /_<unstable_runWithPriority/g, to: '<unstable_runWithPriority' },
    { from: /_<unstable_scheduleCallback/g, to: '<unstable_scheduleCallback' },
    { from: /_<unstable_cancelCallback/g, to: '<unstable_cancelCallback' },
    { from: /_<unstable_wrapCallback/g, to: '<unstable_wrapCallback' },
    { from: /_<unstable_getCurrentPriorityLevel/g, to: '<unstable_getCurrentPriorityLevel' },
    { from: /_<unstable_shouldYield/g, to: '<unstable_shouldYield' },
    { from: /_<unstable_requestPaint/g, to: '<unstable_requestPaint' },
    { from: /_<unstable_now/g, to: '<unstable_now' },
    { from: /_<unstable_getFirstCallbackNode/g, to: '<unstable_getFirstCallbackNode' },
    { from: /_<unstable_ImmediatePriority/g, to: '<unstable_ImmediatePriority' },
    { from: /_<unstable_UserBlockingPriority/g, to: '<unstable_UserBlockingPriority' },
    { from: /_<unstable_NormalPriority/g, to: '<unstable_NormalPriority' },
    { from: /_<unstable_LowPriority/g, to: '<unstable_LowPriority' },
    { from: /_<unstable_IdlePriority/g, to: '<unstable_IdlePriority' },
    { from: /_<unstable_NoPriority/g, to: '<unstable_NoPriority' },
    
    // Fix function parameter syntax errors
    { from: /_\(\)\s*=>/g, to: '() =>' },
    { from: /_\(([^)]+)\)\s*=>/g, to: '($1) =>' },
    { from: /_\(([^)]+),\s*([^)]+)\)\s*=>/g, to: '($1, $2) =>' },
    { from: /_\(([^)]+),\s*([^)]+),\s*([^)]+)\)\s*=>/g, to: '($1, $2, $3) =>' },
    
    // Fix React.useState syntax
    { from: /React\.useState<Date>\(_\(\)\s*=>/g, to: 'React.useState<Date>(() =>' },
    
    // Fix useRef syntax
    { from: /useRef<\(_\([^)]*\)\s*=>\s*[^)]*\)\s*\|\s*null>/g, to: 'useRef<((event: MessageEvent) => void) | null>' },
    { from: /useRef<\(_\(\)\s*=>\s*Promise<[^>]*>\)\s*\|\s*null>/g, to: 'useRef<(() => Promise<any>) | null>' },
    
    // Fix reduce syntax
    { from: /reduce\(_\([^,]+,\s*_([^)]+)\)\s*=>/g, to: 'reduce((sum, $1) =>' },
    
    // Fix useEffect syntax
    { from: /useEffect\(_\(\)\s*=>/g, to: 'useEffect(() =>' },
  ];

  syntaxFixes.forEach(({ from, to }) => {
    fixedContent = fixedContent.replace(from, to);
  });

  return fixedContent;
}

// Main function to process files
function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const fixedContent = fixSyntaxErrors(content);

    if (fixedContent !== content) {
      fs.writeFileSync(filePath, fixedContent);
      console.log(`✅ Fixed syntax: ${filePath}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

// Get list of files with syntax errors
const filesToProcess = [
  'src/components/tasks/MobileTaskDetail.tsx',
  'src/components/tasks/MobileTaskList.tsx',
  'src/components/ui/IconPicker.tsx',
  'src/components/ui/jalali-calendar.tsx',
  'src/components/ui/pagination.tsx',
  'src/components/ui/PWARegistration.tsx',
  'src/components/ui/tooltip.tsx',
  'src/components/wiki/WikiSidebar.tsx',
  'src/e2e/run-e2e-tests.ts',
  'src/hooks/useAuth.ts',
  'src/hooks/useErrorHandler.ts'
];

let fixedCount = 0;
filesToProcess.forEach(file => {
  if (fs.existsSync(file)) {
    if (processFile(file)) {
      fixedCount++;
    }
  }
});

console.log(`\n🎉 Fixed syntax errors in ${fixedCount} files`);
console.log('\n✨ Syntax error fixes complete!');
