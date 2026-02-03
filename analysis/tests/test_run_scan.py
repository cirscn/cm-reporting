import tempfile
import unittest
from pathlib import Path

import analysis.run_scan as run_scan
import analysis.scan_text_diff as scan_text_diff


class TestVersionParsing(unittest.TestCase):
    def test_parse_version_orders_double_digit_minor(self):
        _, key_a = run_scan.parse_version(Path("RMI_CMRT_6.5.xlsx"))
        _, key_b = run_scan.parse_version(Path("RMI_CMRT_6.10.xlsx"))
        self.assertLess(key_a, key_b)

    def test_is_versioned_xlsx_filters_temp_and_non_version(self):
        self.assertFalse(run_scan.is_versioned_xlsx(Path("~$RMI_CMRT_6.5.xlsx")))
        self.assertFalse(run_scan.is_versioned_xlsx(Path("RMI_CMRT_draft.xlsx")))
        self.assertTrue(run_scan.is_versioned_xlsx(Path("RMI_CMRT_6.5.xlsx")))

    def test_load_versions_filters_and_sorts(self):
        with tempfile.TemporaryDirectory() as tmp:
            folder = Path(tmp)
            (folder / "RMI_AMRT_1.10.xlsx").touch()
            (folder / "RMI_AMRT_1.2.xlsx").touch()
            (folder / "RMI_AMRT_draft.xlsx").touch()
            (folder / "~$RMI_AMRT_1.1.xlsx").touch()
            versions = scan_text_diff.load_versions(folder)
            self.assertEqual([v for v, _ in versions], ["1.2", "1.10"])


class TestDiffSummary(unittest.TestCase):
    def test_build_diff_summary_changed_not_added_removed(self):
        baseline_formulas = {"Sheet1": {"A1": "SUM(1,2)"}}
        current_formulas = {"Sheet1": {"A1": "SUM(1,3)"}}
        baseline_dv = {"Sheet1": []}
        baseline_cf = {"Sheet1": []}
        current_dv = {"Sheet1": []}
        current_cf = {"Sheet1": []}
        diff = run_scan.build_diff_summary(
            baseline_formulas,
            baseline_dv,
            baseline_cf,
            current_formulas,
            current_dv,
            current_cf,
        )
        self.assertEqual(diff["Sheet1"]["formula_added"], 0)
        self.assertEqual(diff["Sheet1"]["formula_removed"], 0)
        self.assertEqual(diff["Sheet1"]["formula_changed"], 1)


class TestConditionalFormattingExtensions(unittest.TestCase):
    def test_contains_cf_extension_detects_x14(self):
        xml_bytes = b"<worksheet><extLst><ext><x14:conditionalFormatting/></ext></extLst></worksheet>"
        self.assertTrue(run_scan.contains_cf_extension(xml_bytes))

    def test_contains_cf_extension_ignores_plain_cf(self):
        xml_bytes = b"<worksheet><conditionalFormatting/></worksheet>"
        self.assertFalse(run_scan.contains_cf_extension(xml_bytes))
