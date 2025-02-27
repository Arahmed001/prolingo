#!/bin/bash
# Script to check accessibility implementation across pages

echo "Checking accessibility features across pages..."

# Get list of all page.tsx files
PAGES=$(find app -name "page.tsx" | sort)

# Check for important accessibility features
for page in $PAGES; do
  echo "Checking: $page"
  
  # Check for main content ID
  if grep -q 'id="main-content"' "$page"; then
    echo "  ✅ Has main-content ID"
  else
    echo "  ❌ Missing main-content ID"
  fi
  
  # Check for aria-label usage
  if grep -q 'aria-label' "$page"; then
    echo "  ✅ Uses aria-label attributes"
  else
    echo "  ❌ No aria-label attributes found"
  fi
  
  # Check for tabIndex
  if grep -q 'tabIndex=' "$page"; then
    echo "  ✅ Has tabIndex attributes for keyboard navigation"
  else
    echo "  ❌ No tabIndex attributes found"
  fi
  
  # Check for proper roles
  if grep -q 'role=' "$page"; then
    echo "  ✅ Defines ARIA roles"
  else
    echo "  ❌ No ARIA roles defined"
  fi
  
  # Check for aria-live regions
  if grep -q 'aria-live=' "$page"; then
    echo "  ✅ Uses aria-live for dynamic content"
  else
    echo "  ❌ No aria-live regions found"
  fi
  
  echo ""
done

echo "Accessibility check completed. Address any missing features to improve accessibility." 