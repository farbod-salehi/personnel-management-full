using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Entities.Models
{
    public class InitInfo
    {
        #region Properties
        public Guid Id { get; set; }

        public required int Type { get; set; }

        public Guid? ParentId { get; set; }

        [Required, MaxLength(1024)]
        public required string Title { get; set; }
       
        public bool Active { get; set; }

        public required DateTime CreatedAt { get; set; }

        [Required, MaxLength(450)]
        public required string CreatedBy { get; set; }

        public DateTime? DeletedAt { get; set; }

        [MaxLength(450)]
        public string? DeletedBy { get; set; }

        #endregion Properties

        #region Navigations

        [ForeignKey(nameof(ParentId))]
        public virtual InitInfo? Parent { get; set; }

        public virtual ICollection<InitInfo>? Children { get; set; }


        #endregion Navigations

    }
}
