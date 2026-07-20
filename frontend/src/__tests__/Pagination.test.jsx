// @vitest-environment jsdom
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import Pagination from '../components/Pagination';
import '@testing-library/jest-dom';

describe('Pagination Component', () => {
	
	//The window.scrollTo method does not exist in jsdom, so mock it
	beforeEach(() => {
		window.scrollTo = vi.fn();
	});
	
	//test disabled buttons on boundery edge
	test('disables previouse button on page 1 and next button on last page', () => {
		//set up the mock pagination data for page 1
		const page1Pagination = {
			totalPages: 5,
			hasNextPage: true,
			hasPrevPage: false,
		};
		
		//test the first page
		
		//render page 1
		const { rerender } = render(
			<Pagination pagination={page1Pagination} page={1} setPage={vi.fn()} />
		);

		//on page 1 previouse should be disabled and next should be enabled
		expect(screen.getByRole('button', {name: /previous/i })).toBeDisabled();
		expect(screen.getByRole('button', {name: /next/i })).not.toBeDisabled();
		
		//test a middle page
		//set up the mock pagination data for page 3
		const middlePagePagination = {
			totalPages: 5,
			hasNextPage: true,
			hasPrevPage: true,
		};
		
		//rerender the page on page 3 with the new data
		rerender(
			<Pagination pagination={middlePagePagination} page={3} setPage={vi.fn()} />
		);

		//on a middle page both previous and next should be enabled
		expect(screen.getByRole('button', {name: /Previous/i })).not.toBeDisabled();
		expect(screen.getByRole('button', {name: /Next/i })).not.toBeDisabled();

		//test the last page
		//set up the mock pagination data for page 5 (last page in this case)
		const lastPagePagination = {
			totalPages: 5,
			hasNextPage: false,
			hasPrevPage: true,
		};
		
		//rerender the page on page 5 (the last page) with the new data
		rerender(
			<Pagination pagination={lastPagePagination} page={5} setPage={vi.fn()} />
		);

		//on last page previouse should be enabled and next should be disabled
		expect(screen.getByRole('button', {name: /Previous/i })).not.toBeDisabled();
		expect(screen.getByRole('button', {name: /Next/i })).toBeDisabled();
	});

	//test that clicking on a page number brings you to that page, and updates the visible page numbers by going to another page number that should not have been previously visible.
	test('clicking on a page number button calls setPage with the correct page number', () => {
		const mockSetPage = vi.fn();
		//set up the mock pagination data
		let paginationData = {
			totalPages: 5,
			hasNextPage: true,
			hasPrevPage: false,
		};

		const {rerender} = render(
			<Pagination pagination={paginationData} page={1} setPage={mockSetPage} />
		);

		//find the button for page 5 and click it
		const page5Button = screen.getByRole('button', {name: '5' });
		fireEvent.click(page5Button);

		//varify that the setPage method was called with the number 5
		expect(mockSetPage).toHaveBeenCalledWith(5);
		
		//Rerender the component to test another button, going from page 5 to 4
		paginationData = {
			totalPages: 5,
			hasNextPage: false,
			hasPrevPage: true,
		};

		rerender(
			<Pagination pagination={paginationData} page={5} setPage={mockSetPage} />
		);

		//find the button for page 4 and click it
		const page4Button = screen.getByRole('button', {name: '4' });
		fireEvent.click(page4Button);

		//varify that the setPage method was called with the number 4
		expect(mockSetPage).toHaveBeenCalledWith(4);
	});

	//test that the component is hidden when there is only 1 page
	test('is hidden when there is only 1 page', () => {
		//set up the mock pagination data
		const paginationData = {
			totalPages: 1,
			hasNextPage: false,
			hasPrevPage: false,
		};

		//mirror the conditinal rendersing in the ListingPage.jsx file (the page that displays this componenet)
		const { container } = render(
			<>
				{paginationData.totalPages > 1 && (
					<Pagination pagination={paginationData} page={1} setPage={vi.fn()} />
				)}
			</>
		);

		//varify that the component is not visible
		expect(container.firstChild).toBeNull();
	});

	//tests that the correct page navigation data is displayed on a first page, middle page, and last page
	test('displays the correct page navigation buttons on first. middle, and last pages', () => {
		const page1Pagination = {
			totalPages: 5,
			hasNextPage: true,
			hasPrevPage: false,
		};

		//test the layout on page 1, should be: 1 2 . . . 5
		const { rerender } = render(
			<Pagination pagination={page1Pagination} page={1} setPage={vi.fn()} />
		);
		
		//look for the items that should be displayed
		expect(screen.getByRole('button', {name: '1' })).toBeInTheDocument();
		expect(screen.getByRole('button', {name: '2' })).toBeInTheDocument();
		expect(screen.getByText('...')).toBeInTheDocument();
		expect(screen.getByRole('button', {name: '5' })).toBeInTheDocument();
		//ensure that the items that should not be diaplyed are not displayed
		expect(screen.queryByRole('button', {name: '3' })).not.toBeInTheDocument();
		expect(screen.queryByRole('button', {name: '4' })).not.toBeInTheDocument();

		//test the layout on page 3, should be: 1 2 3 4 5, no ellipsis are needed
		const middlePagePagination = {
			totalPages: 5,
			hasNextPage: true,
			hasPrevPage: true,
		};

		rerender(
			<Pagination pagination={middlePagePagination} page={3} setPage={vi.fn()} />
		);
		
		//check that the correct buttons are rendered
		expect(screen.getByRole('button', { name: '1' })).toBeInTheDocument();
		expect(screen.getByRole('button', { name: '2' })).toBeInTheDocument();
		expect(screen.getByRole('button', { name: '3' })).toBeInTheDocument();
		expect(screen.getByRole('button', { name: '4' })).toBeInTheDocument();
		expect(screen.getByRole('button', { name: '5' })).toBeInTheDocument();
		//ensure that no ellipsis was rendered
		expect(screen.queryByText('...')).not.toBeInTheDocument();

		//test the layout on page 5, should be: 1 . . . 4 5
		const lastPagePagination = {
			totalPages: 5,
			hasNextPage: false,
			hasPrevPage: true,
		};

		rerender(
			<Pagination pagination={lastPagePagination} page={5} setPage={vi.fn()} />
		);
		
		//check that the correct buttons and ellipsis are rendered
		expect(screen.getByRole('button', { name: '1' })).toBeInTheDocument();
		expect(screen.queryByText('...')).toBeInTheDocument();
		expect(screen.getByRole('button', { name: '4' })).toBeInTheDocument();
		expect(screen.getByRole('button', { name: '5' })).toBeInTheDocument();
		//ensure that buttons that should not be rendered are not rendered
		expect(screen.queryByRole('button', { name: '2' })).not.toBeInTheDocument();
		expect(screen.queryByRole('button', { name: '3' })).not.toBeInTheDocument();
	});
});





