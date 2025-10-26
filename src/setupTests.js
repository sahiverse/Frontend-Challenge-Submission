/**
 * Test Setup Configuration
 * 
 * This file runs before all tests and sets up the testing environment.
 * It imports jest-dom which extends Jest with custom DOM matchers.
 * 
 * @module setupTests
 */

/**
 * Import jest-dom for enhanced DOM assertions
 * 
 * jest-dom adds custom Jest matchers for asserting on DOM nodes,
 * making tests more readable and maintainable.
 * 
 * Available matchers include:
 * - toBeDisabled() - Check if element is disabled
 * - toBeEnabled() - Check if element is enabled
 * - toBeEmpty() - Check if element has no content
 * - toBeInTheDocument() - Check if element exists in DOM
 * - toBeVisible() - Check if element is visible
 * - toContainElement() - Check if element contains another element
 * - toContainHTML() - Check if element contains HTML string
 * - toHaveAttribute() - Check if element has attribute
 * - toHaveClass() - Check if element has CSS class
 * - toHaveFocus() - Check if element has focus
 * - toHaveFormValues() - Check form values
 * - toHaveStyle() - Check if element has CSS styles
 * - toHaveTextContent() - Check if element has text content
 * - toHaveValue() - Check if form element has value
 * - toBeChecked() - Check if checkbox/radio is checked
 * - toBePartiallyChecked() - Check if checkbox is partially checked
 * - toHaveDescription() - Check if element has aria-describedby
 * 
 * @example
 * // Instead of:
 * expect(element.disabled).toBe(true);
 * 
 * // You can write:
 * expect(element).toBeDisabled();
 * 
 * @example
 * // Instead of:
 * expect(element.textContent).toMatch(/hello/i);
 * 
 * // You can write:
 * expect(element).toHaveTextContent(/hello/i);
 * 
 * Learn more: https://github.com/testing-library/jest-dom
 */
import '@testing-library/jest-dom';
