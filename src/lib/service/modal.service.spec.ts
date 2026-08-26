import { TestBed } from '@angular/core/testing';
import { ModalService } from './modal.service';

/**
 * Test suite for ModalService
 * Tests modal management functionality including add, remove, open, and close operations
 */
describe('ModalService', () => {
	let service: ModalService;

	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [ModalService]
		});
		service = TestBed.inject(ModalService);
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});

	describe('add', () => {
		it('should add a modal to the modals array', () => {
			const modal = { id: 'test-modal', open: vi.fn().mockName('open'), close: vi.fn().mockName('close') };

			service.add(modal);

			// Verify modal was added by trying to open it
			service.open('test-modal');
			expect(modal.open).toHaveBeenCalled();
		});

		it('should add multiple modals', () => {
			const modal1 = { id: 'modal-1', open: vi.fn().mockName('open1'), close: vi.fn().mockName('close1') };
			const modal2 = { id: 'modal-2', open: vi.fn().mockName('open2'), close: vi.fn().mockName('close2') };

			service.add(modal1);
			service.add(modal2);

			service.open('modal-1');
			service.open('modal-2');

			expect(modal1.open).toHaveBeenCalled();
			expect(modal2.open).toHaveBeenCalled();
		});

		it('should allow adding modal with same id multiple times', () => {
			const modal1 = { id: 'modal', open: vi.fn().mockName('open1'), close: vi.fn().mockName('close1') };
			const modal2 = { id: 'modal', open: vi.fn().mockName('open2'), close: vi.fn().mockName('close2') };

			service.add(modal1);
			service.add(modal2);

			service.open('modal');

			// First modal found should be opened
			expect(modal1.open).toHaveBeenCalled();
		});
	});

	describe('remove', () => {
		it('should remove a modal by id', () => {
			const modal = { id: 'test-modal', open: vi.fn().mockName('open'), close: vi.fn().mockName('close') };

			service.add(modal);
			service.remove('test-modal');

			// Opening should fail silently after removal (modal.open won't be called)
			expect(() => service.open('test-modal')).toThrowError();
		});

		it('should only remove modal with matching id', () => {
			const modal1 = { id: 'modal-1', open: vi.fn().mockName('open1'), close: vi.fn().mockName('close1') };
			const modal2 = { id: 'modal-2', open: vi.fn().mockName('open2'), close: vi.fn().mockName('close2') };

			service.add(modal1);
			service.add(modal2);
			service.remove('modal-1');

			// modal-2 should still work
			service.open('modal-2');
			expect(modal2.open).toHaveBeenCalled();

			// modal-1 should not work
			expect(() => service.open('modal-1')).toThrowError();
		});

		it('should handle removing non-existent modal', () => {
			expect(() => service.remove('non-existent')).not.toThrow();
		});

		it('should handle removing from empty modals array', () => {
			expect(() => service.remove('any-id')).not.toThrow();
		});
	});

	describe('open', () => {
		it('should call open on the modal with matching id', () => {
			const modal = { id: 'test-modal', open: vi.fn().mockName('open'), close: vi.fn().mockName('close') };

			service.add(modal);
			service.open('test-modal');

			expect(modal.open).toHaveBeenCalled();
		});

		it('should open the correct modal when multiple modals exist', () => {
			const modal1 = { id: 'modal-1', open: vi.fn().mockName('open1'), close: vi.fn().mockName('close1') };
			const modal2 = { id: 'modal-2', open: vi.fn().mockName('open2'), close: vi.fn().mockName('close2') };

			service.add(modal1);
			service.add(modal2);
			service.open('modal-2');

			expect(modal1.open).not.toHaveBeenCalled();
			expect(modal2.open).toHaveBeenCalled();
		});

		it('should throw error when modal not found', () => {
			expect(() => service.open('non-existent')).toThrowError();
		});

		it('should open first modal when multiple modals have same id', () => {
			const modal1 = { id: 'modal', open: vi.fn().mockName('open1'), close: vi.fn().mockName('close1') };
			const modal2 = { id: 'modal', open: vi.fn().mockName('open2'), close: vi.fn().mockName('close2') };

			service.add(modal1);
			service.add(modal2);
			service.open('modal');

			expect(modal1.open).toHaveBeenCalled();
			expect(modal2.open).not.toHaveBeenCalled();
		});
	});

	describe('close', () => {
		it('should call close on the modal with matching id', () => {
			const modal = { id: 'test-modal', open: vi.fn().mockName('open'), close: vi.fn().mockName('close') };

			service.add(modal);
			service.close('test-modal');

			expect(modal.close).toHaveBeenCalled();
		});

		it('should close the correct modal when multiple modals exist', () => {
			const modal1 = { id: 'modal-1', open: vi.fn().mockName('open1'), close: vi.fn().mockName('close1') };
			const modal2 = { id: 'modal-2', open: vi.fn().mockName('open2'), close: vi.fn().mockName('close2') };

			service.add(modal1);
			service.add(modal2);
			service.close('modal-1');

			expect(modal1.close).toHaveBeenCalled();
			expect(modal2.close).not.toHaveBeenCalled();
		});

		it('should throw error when modal not found', () => {
			expect(() => service.close('non-existent')).toThrowError();
		});

		it('should close first modal when multiple modals have same id', () => {
			const modal1 = { id: 'modal', open: vi.fn().mockName('open1'), close: vi.fn().mockName('close1') };
			const modal2 = { id: 'modal', open: vi.fn().mockName('open2'), close: vi.fn().mockName('close2') };

			service.add(modal1);
			service.add(modal2);
			service.close('modal');

			expect(modal1.close).toHaveBeenCalled();
			expect(modal2.close).not.toHaveBeenCalled();
		});
	});

	describe('integration scenarios', () => {
		it('should handle add, open, close, remove lifecycle', () => {
			const modal = { id: 'modal', open: vi.fn().mockName('open'), close: vi.fn().mockName('close') };

			service.add(modal);
			service.open('modal');
			expect(modal.open).toHaveBeenCalled();

			service.close('modal');
			expect(modal.close).toHaveBeenCalled();

			service.remove('modal');
			expect(() => service.open('modal')).toThrowError();
		});

		it('should handle multiple modals independently', () => {
			const modal1 = { id: 'modal-1', open: vi.fn().mockName('open1'), close: vi.fn().mockName('close1') };
			const modal2 = { id: 'modal-2', open: vi.fn().mockName('open2'), close: vi.fn().mockName('close2') };
			const modal3 = { id: 'modal-3', open: vi.fn().mockName('open3'), close: vi.fn().mockName('close3') };

			service.add(modal1);
			service.add(modal2);
			service.add(modal3);

			service.open('modal-2');
			service.close('modal-2');
			service.remove('modal-2');

			// modal-1 and modal-3 should still work
			service.open('modal-1');
			service.close('modal-3');

			expect(modal1.open).toHaveBeenCalled();
			expect(modal3.close).toHaveBeenCalled();
		});
	});
});
