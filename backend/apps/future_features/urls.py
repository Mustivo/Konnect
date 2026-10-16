from django.urls import path
from .views import (
    PaymentListCreateView,
    FinancialReportsListView,
    AIAssistantInteractionView,
)

urlpatterns = [
    path('payments/', PaymentListCreateView.as_view(), name='payments-list-create'),
    path('financial-reports/', FinancialReportsListView.as_view(), name='financial-reports-list'),
    path('ai/interact/', AIAssistantInteractionView.as_view(), name='ai-interact'),
]
