// @vitest-environment jsdom
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, test, expect, vi } from 'vitest';
import PropertyFilters from '../components/PropertyFilters';
import '@testing-library/jest-dom';

describe('PropertyFilters Component', () => {

	//test that the propertyFilters are correctly rendering on the screen
	test('renders input fields with initial active filter values', () => {
		const mockActiveFilters = {city: 'testCity', beds: '1'}; //test a text field and a drop down
		
		//render the component
		render(<PropertyFilters activeFilters={mockActiveFilters} onApplyFilters={vi.fn()} />)
		
		//find the elements on screen
		const cityInput = screen.getByPlaceholderText(/Any City/i);
		const bedsInput = screen.getByRole('combobox', {name: /beds/i});
		
		expect(cityInput).toHaveValue('testCity');
		expect(bedsInput).toHaveValue('1');

	});
	
	//test that the user is able to type in the box
	test('allows the user to type and update local input state', () => {
		const emptyFilters = {city: '', beds: ''};
		render(<PropertyFilters activeFilters={emptyFilters} onApplyFilters={vi.fn()} />);

		const cityInput = screen.getByPlaceholderText(/Any city/i);

		//Simulate the user typing "Palm Springs" into the city search box
		fireEvent.change(cityInput, { target: { value: 'TestCity' } });

		//check that the input updates the text to the new value
		expect(cityInput).toHaveValue('TestCity');
	});

	//test that when apply filters is pressed the draft is sent off
	test('calls onApplyFilters with the accumulated draft state when Apply button is clicked', () => {
		//create a mock function to see if the parent callback is called
		const mockOnApplyFilters = vi.fn();
		const emptyFilters = { city: '', beds: '' };
		
		render(<PropertyFilters activeFilters={emptyFilters} onApplyFilters={mockOnApplyFilters} />);

		const cityInput = screen.getByPlaceholderText(/Any city/i);
		const applyButton = screen.getByRole('button', { name: /apply/i });

		//type some draft values
		fireEvent.change(cityInput, { target: { value: 'TestCity' } });

		//click the apply button
		fireEvent.click(applyButton);

		//ensure the values match the expected values
		expect(mockOnApplyFilters).toHaveBeenCalledTimes(1);
		expect(mockOnApplyFilters).toHaveBeenCalledWith(expect.objectContaining({ city: 'TestCity' }));

	});
});





