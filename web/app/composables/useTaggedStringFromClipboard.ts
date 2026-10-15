export function useTaggedStringFromClipboard(tag: string) {
  /**
   * string = tagged value found
   * null = no tagged value in clipboard
   * undefined = clipboard hasn't been read yet
   */
  const content = ref<string | null | undefined>(undefined)
  const tagPrefix = `${tag}-`
  const isElectron = useIsElectron()

  onMounted(async () => {
    window.navigator.clipboard.addEventListener("clipboardchange", updateContent)

    if (isElectron) {
      await updateContent()
    }
  })

  onBeforeUnmount(() => {
    window.navigator.clipboard.removeEventListener("clipboardchange", updateContent)
  })

  async function updateContent() {
    const clipboardContent = await window.navigator.clipboard.readText()
    content.value = clipboardContent.startsWith(tagPrefix)
      ? clipboardContent.substring(tagPrefix.length)
      : null
  }

  async function setContent(content: string) {
    await window.navigator.clipboard.writeText(`${tagPrefix}${content}`)
  }

  return {content, setContent, updateContent}
}
