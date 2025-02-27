#!/bin/bash
# Script to enhance accessibility across all pages in the Next.js project

echo "Enhancing accessibility across all pages..."

# Get list of page.tsx files excluding already enhanced ones
PAGES=$(find app -name "page.tsx" | sort)

# Loop through each page
for page in $PAGES; do
  echo "Processing: $page"
  
  # Skip fully enhanced files (community and login)
  if [[ "$page" == "app/community/page.tsx" || "$page" == "app/login/page.tsx" ]]; then
    echo "  Already fully enhanced, skipping."
    continue
  fi
  
  # Add main content ID to main tag if exists
  if grep -q '<main' "$page"; then
    sed -i '' 's/<main /<main id="main-content" /g' "$page"
    sed -i '' 's/<main>/<main id="main-content">/g' "$page"
  else
    # Try to find a div that might be the main content
    sed -i '' 's/<div className="[^"]*container[^"]*"/<div id="main-content" className="&/g' "$page" || true
    sed -i '' 's/<div className="[^"]*flex[^"]*min-h-screen[^"]*"/<div id="main-content" className="&/g' "$page" || true
    # If we still don't have a main-content ID, add it to the first significant div
    if ! grep -q 'id="main-content"' "$page"; then
      sed -i '' '/<div className=/s//<div id="main-content" className=/g' "$page" || true
    fi
  fi
  
  # Add aria attributes to forms
  if grep -q '<form' "$page"; then
    sed -i '' 's/<form /<form aria-label="Form" /g' "$page"
    # Add aria-required to required inputs
    sed -i '' 's/required/required aria-required="true"/g' "$page"
  fi
  
  # Add aria-live to loading and dynamic sections
  sed -i '' 's/loading">/loading" aria-live="polite">/g' "$page" || true
  sed -i '' 's/className="animate-spin/aria-live="polite" className="animate-spin/g' "$page" || true
  
  # Add proper roles for semantic elements
  sed -i '' 's/<header /<header role="banner" /g' "$page" || true
  sed -i '' 's/<footer /<footer role="contentinfo" /g' "$page" || true
  sed -i '' 's/<nav /<nav role="navigation" /g' "$page" || true
  sed -i '' 's/<div className="alert/<div role="alert" className="alert/g' "$page" || true
  
  # Add role=button and keyboard handler to div onClick elements
  sed -i '' 's/<div onClick/<div role="button" tabIndex={0} onClick/g' "$page"
  sed -i '' '/onClick={[^}]*}/s//& onKeyDown={(e) => { if(e.key === "Enter" || e.key === " ") e.target.click(); }}/g' "$page" || true
  
  # Add tabIndex to interactive elements
  sed -i '' 's/<Link /<Link tabIndex={0} /g' "$page" || true
  sed -i '' 's/<button /<button tabIndex={0} /g' "$page" || true
  sed -i '' 's/<a /<a tabIndex={0} /g' "$page" || true
  
  # Add aria-label to common elements
  sed -i '' 's/<input /<input aria-label="Input field" /g' "$page" || true
  sed -i '' 's/<button /<button aria-label="Button" /g' "$page" || true
  sed -i '' 's/<section /<section aria-labelledby="section-heading" /g' "$page" || true
  
  # Add aria-hidden to decorative icons and elements
  sed -i '' 's/<svg /<svg aria-hidden="true" /g' "$page" || true
  sed -i '' 's/<img [^>]*decorative[^>]*>/<img aria-hidden="true" &/g' "$page" || true
  
  # Add aria-live to error message containers
  sed -i '' 's/<div className="[^"]*error[^"]*"/<div role="alert" aria-live="assertive" className="&/g' "$page" || true
  
  echo "  Enhancements added to $page"
done

echo "Accessibility enhancements completed. Please review the changes and test with a screen reader."

