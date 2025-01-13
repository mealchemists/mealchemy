from rest_framework import viewsets
from rest_framework.response import Response
from .models import Products
from .serializers import ProductSerializer

class ProductViewSet(viewsets.ViewSet):
    def list(self, request): #/api/products
        products = Products.objects.all()
        serializer = ProductSerializer(products, many=True)
        return Response(serializer.data)
        
    def create(self, request):
        pass
    
    def retrieve(self, request, pk=None): #/api/products/<str:id>
        pass
    
    def update(self, request, pk=None): #/api/products/<str:id>
        pass
    
    def destroy(self, request, pk=None): #/api/products/<str:id>
        pass
    
