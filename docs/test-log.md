# Test log

Manual acceptance checks. Each result is **Pass**, **Fail**, or **Not tested**, with a short note. Unit tests (`npm test`) cover money math and status rules separately.

| ID | Check | Result | Notes |
|---|---|---|---|
| 01 | Search, category filter, and both price sorts work together; no-match and invalid product states are handled | Not tested | |
| 02 | Cart merges duplicate products, persists after refresh, and totals 2 × PHP 120.00 + 1 × PHP 85.50 = PHP 325.50 | Not tested | The calculation itself is covered by `src/lib/money.test.ts`. |
| 03 | Empty checkout, invalid customer fields, and invalid or excessive quantities are blocked | Not tested | |
| 04 | Inactive and out-of-stock items can't be ordered; checkout catches price or availability changes before saving | Not tested | |
| 05 | A successful order shows confirmation, appears in admin, reduces stock, and clears the cart; a failed save keeps the cart | Not tested | |
| 06 | Admin product and category changes show on the storefront after refresh; referenced records can't be deleted | Not tested | |
| 07 | Valid status changes save, invalid ones fail, and an eligible cancellation restores stock once, even after refresh | Not tested | |
| 08 | Completed-order sales and unique-email customer counts match the underlying orders | Not tested | |
| 09 | Existing order names and prices don't change after product edits; data persists across restarts | Not tested | |
| 10 | Customer and admin screens work at about 375px and 1280px with no clipped controls, horizontal scrolling, or major console errors | Not tested | |

Environment for the final run: _TODO (browser, device widths, deployed or local)._
