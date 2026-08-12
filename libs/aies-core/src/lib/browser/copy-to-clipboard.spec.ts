import { copyToClipboard } from './copy-to-clipboard';

describe('copyToClipboard', () => {
  const originalClipboard = navigator.clipboard;
  const originalExecCommand = document.execCommand;

  afterEach(() => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: originalClipboard,
    });
    document.execCommand = originalExecCommand;
    document.body.replaceChildren();
  });

  it('uses navigator.clipboard.writeText when available', async () => {
    const writeText = jest.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    });

    await expect(copyToClipboard('airplane')).resolves.toBe(true);
    expect(writeText).toHaveBeenCalledWith('airplane');
  });

  it('falls back to execCommand when Clipboard API throws', async () => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: jest.fn().mockRejectedValue(new Error('denied')),
      },
    });
    document.execCommand = jest.fn().mockReturnValue(true);

    await expect(copyToClipboard('truck')).resolves.toBe(true);
    expect(document.execCommand).toHaveBeenCalledWith('copy');
  });

  it('returns false when both strategies fail', async () => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: jest.fn().mockRejectedValue(new Error('denied')),
      },
    });
    document.execCommand = jest.fn().mockReturnValue(false);

    await expect(copyToClipboard('x')).resolves.toBe(false);
  });
});
