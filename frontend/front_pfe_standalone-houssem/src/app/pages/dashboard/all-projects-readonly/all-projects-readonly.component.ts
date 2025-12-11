this.projetService.findAllProjetsByScrumMaster({ scrumMasterId: userId }).subscribe(
  (response: PageResponseProjetResponse) => {
    this.projects = response.content ?? []
    this.loading = false
  },
  (error: any) => {
    console.error("Error loading projects:", error)
    this.messageService.add({
      severity: "error",
      summary: "Error",
      detail: "Failed to load projects",
    })
    this.loading = false
  }
)